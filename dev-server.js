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
if (!process.env.GEMINI_API_KEY) console.log("주의: .env.local에서 GEMINI_API_KEY를 찾지 못했어.");

const handler = require("./api/generate.js");
const FILES = { "/": ["index.html", "text/html; charset=utf-8"], "/index.html": ["index.html", "text/html; charset=utf-8"], "/style.css": ["style.css", "text/css; charset=utf-8"], "/script.js": ["script.js", "text/javascript; charset=utf-8"] };

const imgDir = path.join(__dirname, "images");
console.log("images 폴더:", fs.existsSync(imgDir) ? fs.readdirSync(imgDir).join(", ") : "없음");

http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/api/generate") {
    let raw = "";
    req.on("data", (c) => { raw += c; });
    req.on("end", () => {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (obj) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(obj)); };
      handler(req, res);
    });
    return;
  }
  // images 폴더의 그림 파일을 보여준다
  const pic = url.match(/^\/images\/[\w-]+\.(jpg|jpeg|png|webp)$/);
  if (pic) {
    const p = path.join(__dirname, url);
    if (!fs.existsSync(p)) { console.log("이미지 파일 없음:", p); res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", pic[1] === "png" ? "image/png" : pic[1] === "webp" ? "image/webp" : "image/jpeg");
    return res.end(fs.readFileSync(p));
  }
  const file = FILES[url]; // 이 목록의 파일만 보여주므로 .env.local은 열리지 않는다
  if (!file) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", file[1]);
  res.end(fs.readFileSync(path.join(__dirname, file[0])));
}).listen(3000, "127.0.0.1", () => console.log("열어봐: http://localhost:3000  (끄려면 Ctrl+C)"));
