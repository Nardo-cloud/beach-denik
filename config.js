// Propojení s databází Supabase.
// Hodnoty najdeš v Supabase: Project Settings → API (Project URL a anon public key).
// Anon klíč je veřejný a smí být v kódu – data chrání pravidla přístupu v databázi.
window.DENIK_CONFIG = {
  supabaseUrl: "",      // např. "https://abcdefghijk.supabase.co"
  supabaseAnonKey: ""   // dlouhý řetězec začínající "eyJ..."
};
