const { db } = require("./_lib.js");

// 생성 기록과 책에 같은 ID를 써서 재시도나 동시 요청에도 한 권만 저장한다.
async function saveBook(userId, ticket, book, linkedId) {
  const id = linkedId || ticket;
  const path = `books?id=eq.${id}&user_id=eq.${userId}&select=id,data`;
  let rows = await db(path);

  if (!rows.length) {
    await db("books?on_conflict=id", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=minimal",
      body: { id, user_id: userId, title: book.title, genre: book.genre, data: book },
    });
    rows = await db(path);
  }

  if (!rows.length) throw new Error("book_save");

  // 책을 먼저 저장한다. 이 갱신이 실패해도 재시도 시 위에서 같은 책을 찾는다.
  await db(`generations?id=eq.${ticket}&user_id=eq.${userId}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: { saved: true, book_id: rows[0].id },
  });
  return { id: rows[0].id, book: rows[0].data };
}

function bookProgress(book) {
  if (book.coverArt) {
    const cuts = book.spreads || (book.chapters || []).flatMap((chapter) => chapter.spreads || []);
    const total = cuts.length + 2;
    const done = cuts.filter((cut) => cut.image).length
      + (book.coverImage ? 1 : 0)
      + (book.plan && book.plan.ref ? 1 : 0);
    return {
      done: done >= total,
      text: done >= total ? "글과 그림 모두 완성" : `글 완성 · 그림 ${done}/${total}장`,
      action: "그림 이어 만들기",
    };
  }

  const done = (book.chapters || []).length;
  const total = (book.outline || []).length;
  const unit = book.genre === "poem" ? "편" : "장";
  return {
    done: !total || done >= total,
    text: total && done < total ? `본문 ${done}/${total}${unit} 완성` : "본문 전체 완성",
    action: "이어서 만들기",
  };
}

module.exports = { saveBook, bookProgress };
