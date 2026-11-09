// 내 컴퓨터에서만 쓰는 테스트 서버. 실행: node dev-server.js
// 화면 파일을 보여주고, /api/generate 요청을 api/generate.js로 넘긴다. 배포에는 쓰이지 않는다.
const http = require("http"), fs = require("fs"), path = require("path");

// .env.local 파일에서 API 키를 읽는다
const envFile = path.join(__dirname, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
for (const k of ["GEMINI_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAILS"]) {
  if (!process.env[k]) console.log(`주의: .env.local에서 ${k}를 찾지 못했어.`);
}

const API = { "/api/config": require("./api/config.js"), "/api/generate": require("./api/generate.js"), "/api/books": require("./api/books.js"), "/api/admin": require("./api/admin.js") };
const FILES = { "/": ["index.html", "text/html; charset=utf-8"], "/index.html": ["index.html", "text/html; charset=utf-8"], "/style.css": ["style.css", "text/css; charset=utf-8"], "/script.js": ["script.js", "text/javascript; charset=utf-8"] };

const imgDir = path.join(__dirname, "images");
console.log("images 폴더:", fs.existsSync(imgDir) ? fs.readdirSync(imgDir).join(", ") : "없음");

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  const handler = API[url];
  if (handler) {
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
      req.query = Object.fromEntries(new URL(req.url, "http://x").searchParams);
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (obj) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(obj)); };
      handler(req, res);
    });
    return;
  }
  // fonts 폴더의 글꼴을 보여준다
  if (/^\/fonts\/[\w-]+\/[\w.-]+\.woff2$/.test(url)) {
    const p = path.join(__dirname, url);
    if (!fs.existsSync(p)) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", "font/woff2");
    return fs.createReadStream(p).pipe(res);
  }
  // images 폴더의 그림과 영상을 보여준다. 영상을 반복 재생하려면 구간 요청(Range)도 받아야 한다.
  const pic = url.match(/^\/images\/[\w-]+\.(jpg|jpeg|png|webp|svg|mp4)$/);
  if (pic) {
    const p = path.join(__dirname, url);
    if (!fs.existsSync(p)) { console.log("이미지 파일 없음:", p); res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", { png: "image/png", webp: "image/webp", svg: "image/svg+xml", mp4: "video/mp4" }[pic[1]] || "image/jpeg");
    res.setHeader("Accept-Ranges", "bytes");
    const size = fs.statSync(p).size;
    const m = String(req.headers.range || "").match(/^bytes=(\d*)-(\d*)$/);
    if (m && (m[1] || m[2])) {
      const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start >= size || start > end) { res.statusCode = 416; res.setHeader("Content-Range", `bytes */${size}`); return res.end(); }
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
      res.setHeader("Content-Length", end - start + 1);
      return fs.createReadStream(p, { start, end }).pipe(res);
    }
    res.setHeader("Content-Length", size);
    return fs.createReadStream(p).pipe(res);
  }
  const file = FILES[url]; // 이 목록의 파일만 보여주므로 .env.local은 열리지 않는다
  if (!file) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", file[1]);
  res.end(fs.readFileSync(path.join(__dirname, file[0])));
}).listen(3000, "127.0.0.1", () => console.log("열어봐: http://localhost:3000  (끄려면 Ctrl+C)"));
