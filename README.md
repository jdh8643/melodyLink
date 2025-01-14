

# Melody Link (멜로디 링크)

## 프로젝트 소개
Melody Link는 노래 부르기와 공유를 위한 소셜 플랫폼입니다. 사용자들이 자신의 노래 실력을 뽐내고, 다른 사람들과 소통하며, 음악을 통해 서로 교류할 수 있는 공간을 제공합니다.

## 주요 기능
- 🎤 노래 공유: 자신이 부른 노래를 업로드하고 공유
- 💬 소셜 기능: 댓글, 좋아요를 통한 사용자 간 소통
- 🎵 음악 검색: 가수나 노래 제목으로 반주 음악 검색
- 📊 장르별 인기 차트: K-POP, 힙합, 인디 장르의 인기 음악 제공
- 👥 커뮤니티: 사용자들과 음악 취향 공유 및 소통
- 🏆 랭킹 시스템: 인기 있는 커버 영상 순위 제공

## 기술 스택
- **Frontend**: React, TypeScript
- **스타일링**: Tailwind CSS
- **API**: YouTube Data API v3
- **인증/데이터베이스**: Supabase
- **상태 관리**: React Hooks
- **라우팅**: React Router

## 환경 설정
```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 주요 컴포넌트
- `Index.tsx`: 메인 페이지 및 검색 기능
- `Login.tsx`: 사용자 인증 페이지
- `Video.tsx`: 비디오 재생 및 댓글 기능
- `youtube.ts`: YouTube API 관련 유틸리티
- `supabase.ts`: Supabase 클라이언트 설정

## 시작하기
```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev
```

## 데이터베이스 구조
- Users: 사용자 정보
- Videos: 업로드된 커버 영상
- Comments: 영상 댓글
- Likes: 좋아요 정보

## 참고사항
- YouTube API 키가 필요합니다
- Supabase 프로젝트 설정이 필요합니다
- 실제 배포 시 모든 API 키는 환경변수로 관리해야 합니다

## 라이선스
MIT License
