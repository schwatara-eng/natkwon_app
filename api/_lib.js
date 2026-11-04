// api 폴더의 서버 코드가 함께 쓰는 도구. 파일 이름이 _로 시작하면 Vercel이 주소로 공개하지 않는다.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isId = (v) => typeof v === "string" && UUID.test(v);

function send(res, status, data) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(data);
}

function configured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
const base = () => process.env.SUPABASE_URL.replace(/\/+$/, "");

// 데이터베이스 호출. 서버에서만 쓰는 service role 키를 사용한다.
async function db(path, { method = "GET", body, prefer, count } = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key, "Content-Type": "application/json" };
  // 예전 형식 키(eyJ로 시작)만 Authorization에도 넣는다. 새 형식 비밀 키(sb_secret_)는 apikey만 보낸다.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  const wants = [prefer, count ? "count=exact" : ""].filter(Boolean).join(",");
  if (wants) headers.Prefer = wants;
  const r = await fetch(`${base()}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  if (!r.ok) {
    console.error("Supabase 오류", r.status, path.split("?")[0], text.slice(0, 200));
    throw new Error("db");
  }
  const data = text ? JSON.parse(text) : null;
  if (count) {
    const range = r.headers.get("content-range") || "";
    return { data, total: Number(range.split("/")[1]) || 0 };
  }
  return data;
}

// 브라우저가 보낸 로그인 토큰을 Supabase에 확인한다. 토큰이 없거나 틀리면 null.
async function getUser(req) {
  const m = String(req.headers.authorization || "").match(/^Bearer (.+)$/);
  if (!m) return null;
  const r = await fetch(`${base()}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${m[1]}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}

function isAdmin(user) {
  const list = String(process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!user.email && list.includes(user.email.toLowerCase());
}

function displayName(user) {
  const m = user.user_metadata || {};
  return String(m.full_name || m.name || (user.email || "").split("@")[0]).slice(0, 60);
}

async function ensureProfile(user) {
  await db("profiles?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: { id: user.id, email: user.email || null, name: displayName(user) },
  });
}

const defaultLimit = () => {
  const n = parseInt(process.env.DEFAULT_DAILY_LIMIT, 10);
  return Number.isFinite(n) && n >= 0 ? n : 3;
};

// 한국 시간 기준 오늘 0시
function todayStart() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - 9 * 3600 * 1000).toISOString();
}

async function usage(userId) {
  const [rows, today] = await Promise.all([
    db(`profiles?id=eq.${userId}&select=daily_limit`),
    db(`generations?user_id=eq.${userId}&created_at=gte.${encodeURIComponent(todayStart())}&select=id`, { count: true }),
  ]);
  const own = rows && rows[0] ? rows[0].daily_limit : null;
  return { used: today.total, limit: own == null ? defaultLimit() : own };
}

// 요청 주소의 ?id=... 값을 읽는다
function query(req) {
  if (req.query) return req.query;
  return Object.fromEntries(new URL(req.url, "http://x").searchParams);
}

// 로그인 계정을 지운다. 프로필, 책, 생성 기록은 데이터베이스 설정에 따라 함께 지워진다.
async function deleteAuthUser(id) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const headers = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  const r = await fetch(`${base()}/auth/v1/admin/users/${id}`, { method: "DELETE", headers });
  if (!r.ok) {
    console.error("계정 삭제 실패", r.status, (await r.text()).slice(0, 200));
    throw new Error("auth");
  }
}

module.exports = { deleteAuthUser, isId, send, configured, db, getUser, isAdmin, displayName, ensureProfile, defaultLimit, todayStart, usage, query };
