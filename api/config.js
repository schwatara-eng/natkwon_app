// 브라우저의 로그인 도구에 필요한 공개 설정만 내려준다. anon 키는 공개되어도 되는 키다.
const { send, configured } = require("./_lib.js");

module.exports = function handler(req, res) {
  if (!configured()) return send(res, 503, { error: "no_supabase" });
  send(res, 200, { supabaseUrl: process.env.SUPABASE_URL, anonKey: process.env.SUPABASE_ANON_KEY });
};
