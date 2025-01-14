
-- Comments 테이블 생성
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments 테이블에 RLS 정책 설정
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 댓글을 볼 수 있음"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "인증된 사용자가 댓글을 작성할 수 있음"
    ON public.comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "자신의 댓글만 수정할 수 있음"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "자신의 댓글만 삭제할 수 있음"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- Likes 테이블 생성
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_dislike BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Likes 테이블에 RLS 정책 설정
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 좋아요를 볼 수 있음"
    ON public.likes FOR SELECT
    USING (true);

CREATE POLICY "인증된 사용자가 좋아요를 할 수 있음"
    ON public.likes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "자신의 좋아요만 취소할 수 있음"
    ON public.likes FOR DELETE
    USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);