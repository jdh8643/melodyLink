import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration");
}

// 싱글톤 패턴으로 Supabase 클라이언트 생성
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;

  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: "melody-link-auth-token",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch:
        typeof window !== "undefined" ? window.fetch.bind(window) : undefined,
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  return supabaseInstance;
})();

// 로그인 함수 확인
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// 로그아웃 함수 확인
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
