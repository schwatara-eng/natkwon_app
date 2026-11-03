// 관리자 전용: 통계, 회원과 책 목록, 회원별 하루 생성 한도 변경. 책 삭제는 api/books.js가 맡는다.
const { isId, send, configured, db, getUser, isAdmin, defaultLimit, todayStart } = require("./_lib.js");

const KST = 9 * 3600 * 1000;
const dayKey = (t) => new Date(new Date(t).getTime() + KST).toISOString().slice(0, 10);

module.exports = async function handler(req, res) {
  if (!configured()) return send(res, 503, { error: "no_supabase" });
  try {
    const user = await getUser(req);
    if (!user) return send(res, 401, { error: "login" });
    if (!isAdmin(user)) return send(res, 403, { error: "forbidden" });

    if (req.method === "PATCH") {
      const { userId, dailyLimit } = req.body || {};
      const value = dailyLimit === null ? null : Number(dailyLimit);
      if (!isId(userId) || (value !== null && (!Number.isInteger(value) || value < 0 || value > 1000))) return send(res, 400, { error: "bad_request" });
      const rows = await db(`profiles?id=eq.${userId}`, { method: "PATCH", prefer: "return=representation", body: { daily_limit: value } });
      if (!rows.length) return send(res, 404, { error: "not_found" });
      return send(res, 200, { ok: true });
    }
    if (req.method !== "GET") return send(res, 405, { error: "method" });

    const since = new Date(Date.now() - 13 * 24 * 3600 * 1000);
    const [users, books, totalBooks, gens] = await Promise.all([
      db("profiles?select=id,email,name,daily_limit,created_at&order=created_at.desc&limit=500", { count: true }),
      db("books?select=id,title,genre,user_id,created_at&order=created_at.desc&limit=200"),
      db("books?select=id&limit=1", { count: true }),
      db(`generations?created_at=gte.${encodeURIComponent(new Date(dayKey(since) + "T00:00:00+09:00").toISOString())}&select=user_id,created_at&limit=20000`),
    ]);

    const start = todayStart();
    const today = {}, perDay = {};
    for (const g of gens) {
      const k = dayKey(g.created_at);
      perDay[k] = (perDay[k] || 0) + 1;
      if (new Date(g.created_at) >= new Date(start)) today[g.user_id] = (today[g.user_id] || 0) + 1;
    }
    const daily = [];
    for (let i = 13; i >= 0; i--) {
      const k = dayKey(Date.now() - i * 24 * 3600 * 1000);
      daily.push({ day: k, count: perDay[k] || 0 });
    }
    const owner = {};
    users.data.forEach((u) => { owner[u.id] = u; });
    const bookCount = {};
    books.forEach((b) => { bookCount[b.user_id] = (bookCount[b.user_id] || 0) + 1; });

    return send(res, 200, {
      stats: { users: users.total, books: totalBooks.total, today: Object.values(today).reduce((a, b) => a + b, 0) },
      defaultLimit: defaultLimit(),
      daily,
      users: users.data.map((u) => ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at, daily_limit: u.daily_limit, today: today[u.id] || 0, books: bookCount[u.id] || 0 })),
      books: books.map((b) => ({ id: b.id, title: b.title, genre: b.genre, created_at: b.created_at, owner: owner[b.user_id] ? owner[b.user_id].name || owner[b.user_id].email : "알 수 없음" })),
    });
  } catch (e) {
    console.error("admin 오류", e && e.message);
    return send(res, 502, { error: "upstream" });
  }
};
