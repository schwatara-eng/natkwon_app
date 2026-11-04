// 관리자 전용: 전체 집계, 회원별 한도, 최근 책과 생성 오류 이력.
const { isId, send, configured, db, dbAll, getUser, isAdmin, defaultLimit } = require("./_lib.js");

const KST = 9 * 3600 * 1000;
const dayKey = (time) => new Date(new Date(time).getTime() + KST).toISOString().slice(0, 10);

async function loadActivity(start) {
  try {
    const [events, today] = await Promise.all([
      db("generation_events?outcome=neq.success&select=id,user_id,generation_id,book_id,step,outcome,error_code,created_at&order=created_at.desc,id.desc&limit=50", { timeoutMs: 3000 }),
      db(`generation_events?outcome=neq.success&created_at=gte.${encodeURIComponent(start)}&select=id&limit=1`, { count: true, timeoutMs: 3000 }),
    ]);
    return { available: true, events, today: today.total };
  } catch (error) {
    return { available: false, events: [], today: null };
  }
}

async function dashboard() {
  const today = dayKey(Date.now());
  const since = dayKey(Date.now() - 13 * 86400000);
  const start = new Date(`${today}T00:00:00+09:00`).toISOString();
  const [users, books, recentBooks, generations, activity] = await Promise.all([
    dbAll("profiles?select=id,email,name,daily_limit,created_at&order=id"),
    dbAll("books?select=id,user_id,created_at&order=id"),
    db("books?select=id,title,genre,user_id,created_at&order=created_at.desc,id.desc&limit=200"),
    dbAll(`generations?created_at=gte.${encodeURIComponent(new Date(`${since}T00:00:00+09:00`).toISOString())}&select=id,user_id,created_at,book_id,saved&order=id`),
    loadActivity(start),
  ]);

  const owners = new Map(users.map((user) => [user.id, user]));
  const ownerName = (id) => {
    const user = owners.get(id);
    return user ? user.name || user.email : "탈퇴한 회원";
  };
  const bookCounts = new Map();
  const todayCounts = new Map();
  const perDay = new Map();
  for (const book of books) bookCounts.set(book.user_id, (bookCounts.get(book.user_id) || 0) + 1);
  for (const generation of generations) {
    const day = dayKey(generation.created_at);
    perDay.set(day, (perDay.get(day) || 0) + 1);
    if (day === today) todayCounts.set(generation.user_id, (todayCounts.get(generation.user_id) || 0) + 1);
  }

  return {
    stats: {
      users: users.length,
      books: books.length,
      started: perDay.get(today) || 0,
      savedToday: books.filter((book) => dayKey(book.created_at) === today).length,
      issuesToday: activity.today,
    },
    defaultLimit: defaultLimit(),
    daily: Array.from({ length: 14 }, (_, index) => {
      const day = dayKey(Date.now() - (13 - index) * 86400000);
      return { day, count: perDay.get(day) || 0 };
    }),
    users: users.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((user) => ({
      ...user,
      isAdmin: isAdmin(user),
      effectiveLimit: isAdmin(user) ? null : user.daily_limit ?? defaultLimit(),
      today: todayCounts.get(user.id) || 0,
      books: bookCounts.get(user.id) || 0,
    })),
    books: recentBooks.map((book) => ({ ...book, owner: ownerName(book.user_id) })),
    activity: {
      available: activity.available,
      events: activity.events.map((event) => ({ ...event, owner: ownerName(event.user_id) })),
      unresolved: generations.filter((generation) => !generation.book_id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 20)
        .map((generation) => ({ ...generation, owner: ownerName(generation.user_id) })),
    },
  };
}

module.exports = async function handler(req, res) {
  if (!configured()) return send(res, 503, { error: "no_supabase" });
  try {
    const user = await getUser(req);
    if (!user) return send(res, 401, { error: "login" });
    if (!isAdmin(user)) return send(res, 403, { error: "forbidden" });

    if (req.method === "PATCH") {
      const { userId, dailyLimit } = req.body || {};
      const value = dailyLimit === null ? null : Number(dailyLimit);
      if (!isId(userId) || (value !== null && (!Number.isInteger(value) || value < 0 || value > 1000))) {
        return send(res, 400, { error: "bad_request" });
      }
      const profiles = await db(`profiles?id=eq.${userId}&select=id,email`);
      if (!profiles.length) return send(res, 404, { error: "not_found" });
      if (isAdmin(profiles[0])) return send(res, 400, { error: "admin_unlimited" });
      await db(`profiles?id=eq.${userId}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: { daily_limit: value },
      });
      return send(res, 200, { ok: true, effectiveLimit: value ?? defaultLimit() });
    }
    if (req.method !== "GET") return send(res, 405, { error: "method" });
    return send(res, 200, await dashboard());
  } catch (error) {
    console.error("admin 오류", error && error.message);
    return send(res, 502, { error: "upstream" });
  }
};
