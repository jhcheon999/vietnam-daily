// 매일 베트남어 카톡 발송 (카카오 "나에게 보내기", 무료)
// 실행: node send.js            (실제 발송)
//       node send.js --dry      (발송 없이 메시지만 출력, 토큰 불필요)
// 필요 환경변수: KAKAO_REST_KEY, KAKAO_REFRESH_ME, KAKAO_REFRESH_WIFE
// (START_DATE 를 주면 그 날짜 기준 Day 계산, 없으면 lessons.json 의 startDate)
require('./env');
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry');
const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, 'lessons.json'), 'utf8'));

function dayIndex() {
  const start = new Date((process.env.START_DATE || lessons.startDate) + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((today - start) / 86400000));
}

// 카카오 text 템플릿 200자 제한에 맞춰 간결하게
function buildMessage(who, idx) {
  const dayNo = idx + 1;
  let lines = [`🇻🇳 베트남어 Day ${dayNo} · ${who.label}`];
  for (const s of who.streams) {
    const it = s.items[idx % s.items.length];
    lines.push(`${s.icon} [${s.name}]`);
    lines.push(`${it.vi} — ${it.ko} (${it.pron})`);
  }
  lines.push('화이팅! 💪');
  return lines.join('\n');
}

async function refreshAccess(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token', client_id: process.env.KAKAO_REST_KEY, refresh_token: refreshToken,
  });
  const r = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }, body,
  });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error('토큰 갱신 실패: ' + JSON.stringify(j));
  return j.access_token;
}

async function sendToMe(accessToken, text) {
  const body = new URLSearchParams({
    template_object: JSON.stringify({
      object_type: 'text', text,
      link: { web_url: 'https://translate.google.com/?sl=vi&tl=ko', mobile_web_url: 'https://translate.google.com/?sl=vi&tl=ko' },
      button_title: '사전 열기',
    }),
  });
  const r = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('발송 실패: ' + JSON.stringify(j));
}

async function deliver(personKey, refreshEnv) {
  const who = lessons[personKey];
  const msg = buildMessage(who, dayIndex());
  console.log('----- ' + who.label + ' -----\n' + msg + '\n(' + msg.length + '자)');
  if (DRY) return;
  const refresh = process.env[refreshEnv];
  if (!refresh) { console.log('  (' + refreshEnv + ' 없음 — 건너뜀)'); return; }
  const access = await refreshAccess(refresh);
  await sendToMe(access, msg);
  console.log('  ✅ 발송 완료');
}

(async () => {
  console.log('Day index =', dayIndex(), DRY ? '(dry run)' : '');
  await deliver('me', 'KAKAO_REFRESH_ME');
  // 애오니(wife)도 받으려면 KAKAO_REFRESH_WIFE 토큰 받아 아래 주석을 풀면 됩니다.
  // await deliver('wife', 'KAKAO_REFRESH_WIFE');
})().catch((e) => { console.error(e.message); process.exit(1); });
