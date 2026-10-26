// .env 파일을 읽어 process.env 에 넣는다 (외부 패키지 없이). GitHub Actions 에서는 Secrets 를 직접 쓰므로 .env 불필요.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '.env');
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] == null) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
