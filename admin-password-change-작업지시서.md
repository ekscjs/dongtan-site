# 작업 지시서 — 관리자 비밀번호 변경 기능 추가

## 배경
현재 /admin 로그인은 Vercel 환경변수 ADMIN_PASSWORD와 평문 비교 방식.
비번 바꾸려면 매번 Vercel 대시보드 들어가서 env var 수정 + 재배포 필요.
관리자페이지 안에서 직접 비번 바꿀 수 있게 개선 + 해시 저장으로 보안도 강화.

## 작업 범위 (파일: src/app/api/admin/login/route.ts 등)

1. Supabase에 테이블 추가 (마이그레이션)
   - `admin_settings` (id, password_hash, updated_at) 또는 기존 설정 테이블 재사용
   - 최초 1회: 현재 ADMIN_PASSWORD 값을 bcrypt로 해시해서 이 테이블에 시드

2. `src/app/api/admin/login/route.ts` 수정
   - `password !== process.env.ADMIN_PASSWORD` 비교 제거
   - Supabase에서 password_hash 조회 → bcrypt.compare로 검증
   - (마이그레이션 기간 대비: DB에 값 없으면 기존 env var로 폴백 검증 후 자동 시드해도 됨)

3. `/admin` 안에 "비밀번호 변경" UI 추가
   - 이미 로그인된 상태(admin_auth 쿠키)에서만 접근 가능한 화면/모달
   - 입력: 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인
   - PATCH API 라우트 신설 (예: /api/admin/password) — admin_auth 확인 → 현재 비번 검증 → bcrypt 해시 후 DB 업데이트

4. bcrypt 패키지 설치 필요 시 package.json에 추가

## 완료 후 확인
- 기존 비번으로 로그인 여전히 되는지 (마이그레이션 정상 확인)
- 새 비번으로 변경 후 재로그인 되는지
- 틀린 현재 비번 입력 시 변경 거부되는지
- git commit + push (일반 배포 절차대로)

## 주의
- ADMIN_PASSWORD 환경변수는 완전히 제거하지 말고, 당분간 폴백용으로 남겨둬도 무방 (문제 생기면 롤백 가능)
