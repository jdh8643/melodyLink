// 데이터베이스 타입 정의 확인
interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          // ... 기타 필요한 필드들
        };
        Insert: {
          // 삽입 시 필요한 타입
        };
        Update: {
          // 업데이트 시 필요한 타입
        };
      };
    };
  };
}
