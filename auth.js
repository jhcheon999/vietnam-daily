// 카카오 refresh token 1회 추출 도우미 (로컬에서 한 번만 실행)
// 사용법:  .env 에 KAKAO_REST_KEY 넣고  ->  node auth.js
//   뜨는 주소를 브라우저에서 열어 로그인/동의 -> 터미널에 refresh_token 출력
//   (지훈은 지훈 카톡으로, 애오니는 애오니 카톡으로 각각 로그인해 2개 확보)
require('./env');
const http = require('http');

const REST = process.env.KAKAO_REST_KEY;
const REDIRECT = 'http://localhost:3000/callback';
if (!REST) { console.error('.env 에 KAKAO_REST_KEY 가 없습니다.'); process.exit(1); }

const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}&scope=talk_message`;

console.log('\n아래 주소를 브라우저에서 열어 로그인하세요:\n\n' + authUrl + '\n');

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost:3000');
  if (u.pathname !== '/callback') { res.end('ok'); return; }
  const code = u.searchParams.get('code');
  if (!code) { res.end('code 없음'); return; }
  try {
    const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: REST, redirect_uri: REDIRECT, code });
    const r = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, body,
    });
    const j = await r.json();
    if (!j.refresh_token) throw new Error(JSON.stringify(j));
    console.log('\n✅ refresh_token (이 값을 복사해 두세요):\n\n' + j.refresh_token + '\n');
    res.end('완료! 터미널에 출력된 refresh_token 을 복사하세요. 이 창은 닫아도 됩니다.');
  } catch (e) {
    console.error('실패:', e.message);
    res.end('실패: ' + e.message);
  }
  setTimeout(() => process.exit(0), 500);
}).listen(3000, () => console.log('(로그인 완료를 기다리는 중... localhost:3000)'));
