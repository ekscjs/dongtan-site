import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .order("publish_at", { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
