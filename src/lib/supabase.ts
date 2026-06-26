import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tag: string;
  published: boolean;
  created_at: string;
  publish_at: string | null;
};
