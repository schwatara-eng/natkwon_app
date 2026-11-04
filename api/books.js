// 내 정보와 내 책 저장·목록·열람·삭제. 관리자는 다른 사람의 책도 열고 지울 수 있다.
const { isId, send, configured, db, getUser, isAdmin, displayName, ensureProfile, usage, query } = require("./_lib.js");

const GENRES = ["novel", "essay", "poem", "kids", "pic"];
const str = (v, max) => String(v == null ? "" : v).slice(0, max);

// 화면이 쓰는 항목만 남긴다. 이미지 주소 같은 다른 값은 저장하지 않는다.
function cleanBook(b) {
  if (!b || !GENRES.includes(b.genre) || !b.title || !Array.isArray(b.chapters) || !b.chapters.length) return null;
  return {
    genre: b.genre, author: "Gemini", name: str(b.name, 20), keywords: str(b.keywords, 500),
    title: str(b.title, 60), subtitle: str(b.subtitle, 80), tagline: str(b.tagline, 200), blurb: str(b.blurb, 1000),
    palette: str(b.palette, 20), motif: str(b.motif, 20),
    note: { title: str(b.note && b.note.title, 20), text: str(b.note && b.note.text, 1500) },
    outline: (Array.isArray(b.outline) ? b.outline : []).slice(0, 12).map((t) => str(t, 60)),
    chapters: b.chapters.slice(0, 12).map((c) => ({ title: str(c && c.title, 60), text: str(c && c.text, 20000) })),
  };
}

module.exports = async function handler(req, res) {
  if (!configured()) return send(res, 503, { error: "no_supabase" });
  try {
    const user = await getUser(req);
    if (!user) return send(res, 401, { error: "login" });
    const q = query(req), admin = isAdmin(user);

    if (req.method === "GET") {
      if (q.view === "me") {
        await ensureProfile(user);
        const u = await usage(user.id);
        return send(res, 200, { user: { name: displayName(user), email: user.email, isAdmin: admin }, ...u });
      }
      if (q.id) {
        if (!isId(q.id)) return send(res, 400, { error: "bad_request" });
        const owner = admin ? "" : `&user_id=eq.${user.id}`;
        const rows = await db(`books?id=eq.${q.id}${owner}&select=id,data`);
        if (!rows.length) return send(res, 404, { error: "not_found" });
        return send(res, 200, { id: rows[0].id, book: rows[0].data });
      }
      const books = await db(`books?user_id=eq.${user.id}&select=id,title,genre,created_at,subtitle:data->>subtitle,palette:data->>palette,motif:data->>motif&order=created_at.desc&limit=200`);
      return send(res, 200, { books });
    }

    if (req.method === "POST") {
      const { ticket } = req.body || {};
      const book = cleanBook((req.body || {}).book);
      if (!isId(ticket) || !book) return send(res, 400, { error: "bad_request" });
      // 생성 한 번에 책 한 권만 저장할 수 있다
      const gens = await db(`generations?id=eq.${ticket}&user_id=eq.${user.id}&select=id,saved`);
      if (!gens.length) return send(res, 404, { error: "not_found" });
      if (gens[0].saved) return send(res, 409, { error: "already_saved" });
      const claimed = await db(`generations?id=eq.${ticket}&saved=eq.false`, { method: "PATCH", prefer: "return=representation", body: { saved: true } });
      if (!claimed.length) return send(res, 409, { error: "already_saved" });
      const rows = await db("books", { method: "POST", prefer: "return=representation", body: { user_id: user.id, title: book.title, genre: book.genre, data: book } });
      await db(`generations?id=eq.${ticket}`, { method: "PATCH", prefer: "return=minimal", body: { book_id: rows[0].id } });
      return send(res, 200, { id: rows[0].id });
    }

    if (req.method === "DELETE") {
      if (!isId(q.id)) return send(res, 400, { error: "bad_request" });
      const owner = admin ? "" : `&user_id=eq.${user.id}`;
      const rows = await db(`books?id=eq.${q.id}${owner}`, { method: "DELETE", prefer: "return=representation" });
      if (!rows.length) return send(res, 404, { error: "not_found" });
      return send(res, 200, { ok: true });
    }
    return send(res, 405, { error: "method" });
  } catch (e) {
    console.error("books 오류", e && e.message);
    return send(res, 502, { error: "upstream" });
  }
};
