# 작업 지시서 — 비밀번호 입력칸에 "보기" 눈 아이콘 추가

파일: `src/app/admin/page.tsx`

## 대상 입력칸 (총 4곳)
1. 로그인 화면 비밀번호 입력 (`password` state)
2. 비밀번호 변경 모달 — 현재 비밀번호 (`pwCurrent`)
3. 비밀번호 변경 모달 — 새 비밀번호 (`pwNew`)
4. 비밀번호 변경 모달 — 새 비밀번호 확인 (`pwConfirm`)

## 구현 방식
- 각 input을 감싸는 `relative` 컨테이너 div 추가
- input의 `type`을 상태에 따라 `"password"` / `"text"`로 토글 (예: `showPw1`, `showPw2` 등 boolean state 각 입력칸마다, 또는 4개를 객체 하나로 묶어서 관리)
- input 안쪽 오른쪽에 눈 아이콘 버튼 (`type="button"`, absolute 포지션, `top-1/2 -translate-y-1/2 right-3`) — 클릭 시 해당 필드의 show state 토글
- 아이콘은 이모지(👁 / 🙈)로 간단히 처리하거나, lucide-react 이미 프로젝트에 있으면 Eye/EyeOff 아이콘 사용 (package.json 확인해서 있으면 그걸로, 없으면 이모지로)
- input에 오른쪽 패딩 살짝 추가해서 아이콘과 텍스트 안 겹치게 (`pr-10` 등)

## 완료 후 확인
- 로그인 화면에서 눈 아이콘 눌러서 비밀번호 평문 보이는지
- 비밀번호 변경 모달 3칸 각각 독립적으로 토글되는지 (하나 누른다고 나머지 다 같이 안 풀리는지)
- 모바일에서도 아이콘 클릭 영역 충분한지
- npm run build 통과 확인 후 git commit + push
