# 매일 베트남어 카톡 (무료)

매일 베트남 시간 12:15에 카카오톡 "나와의 채팅"으로 베트남어 레슨을 받는다.
- 지훈: 일상 단어 / 개발 업무용어 / 기본 회화 (각 분야에서 매일 하나씩, 30개 순환)

콘텐츠는 `lessons.json` 에 미리 들어 있어 **API 호출이 없다 → 매달 0원.** (GitHub Actions·카카오 "나에게 보내기" 모두 무료)

## 구성
```
lessons.json              레슨 데이터 (분야별 30개씩)
send.js                   오늘 레슨을 만들어 카톡 발송
auth.js                   카카오 refresh token 1회 추출 도우미
env.js                    .env 로더
.github/workflows/daily.yml   매일 cron (05:15 UTC = 베트남 12:15)
```

## 셋업 (완료됨)
1. 카카오 developers 앱 (비즈 앱 전환, 리다이렉트 URI `http://localhost:3000/callback`, talk_message 동의)
2. `node auth.js` 로 지훈 refresh token 확보
3. GitHub 저장소 Secrets 에 `KAKAO_REST_KEY`, `KAKAO_REFRESH_ME` 등록
4. Actions 에서 자동 실행

## 로컬에서 수동 발송
```
node send.js --dry      # 발송 없이 오늘 메시지만 출력
node send.js            # .env 의 토큰으로 실제 발송
```

## 바꾸고 싶을 때
- **발송 시각**: `.github/workflows/daily.yml` 의 cron (UTC). 05:15 UTC = 베트남 12:15 / 한국 14:15
- **내용 추가**: `lessons.json` 각 분야 배열에 항목 추가
- **애오니도 받기**: 애오니 계정으로 `node auth.js` → 토큰을 Secret `KAKAO_REFRESH_WIFE` 로 등록 →
  send.js 의 `await deliver('wife', ...)` 주석 해제, 워크플로 env 에 `KAKAO_REFRESH_WIFE` 추가

## 참고
- 카카오 "나에게 보내기"는 무료. 메시지는 카톡 "나와의 채팅" 방에 쌓인다.
- refresh token 은 매일 쓰면 자동 연장되어 끊기지 않는다.
- GitHub Actions cron 은 부하에 따라 몇 분~십몇 분 늦을 수 있다.
