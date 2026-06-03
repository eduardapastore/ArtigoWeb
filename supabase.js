const SUPABASE_URL =
"https://rlzerjxufsoqlgkktypt.supabase.co";

const SUPABASE_KEY =
"sb_publishable_6VD8oikIQAlsWaPcwl20qQ_XZcrYU_b";

const supabaseClient =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase conectado!");
console.log(supabaseClient);