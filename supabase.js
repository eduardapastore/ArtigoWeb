const SUPABASE_URL =
"https://zpdviwpomhvtxgqilftu.supabase.co";

const SUPABASE_KEY =
"sb_publishable_ST7-kTKKLJcyz9oUWH5fLg_7LD-XoBy";

const supabaseClient =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase conectado!");
console.log(supabaseClient);