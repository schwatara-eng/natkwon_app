const { db, send } = require("./_lib.js");

let retryAfter = 0;

// 이력 저장이 실패해도 책 생성 응답은 막지 않는다.
async function recordActivity(context, outcome, errorCode = null) {
  if (!context || Date.now() < retryAfter) return;
  try {
    await db("generation_events", {
      method: "POST",
      prefer: "return=minimal",
      timeoutMs: 1500,
      body: {
        user_id: context.userId,
        generation_id: context.ticket || null,
        book_id: context.bookId || null,
        step: context.step,
        outcome,
        error_code: errorCode,
      },
    });
  } catch (error) {
    retryAfter = Date.now() + 60000;
    console.error("생성 이력을 저장하지 못했습니다. generation_events 테이블과 DB 연결을 확인하세요.");
  }
}

async function sendActivity(res, status, data) {
  const context = res.generationActivity;
  if (context) {
    await recordActivity({
      ...context,
      ticket: context.ticket || data.ticket,
      bookId: context.bookId || data.id,
    }, status >= 400 ? "failed" : "success", data.error || null);
  }
  return send(res, status, data);
}

module.exports = { recordActivity, sendActivity };
