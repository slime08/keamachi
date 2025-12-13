1) node_modules / dist / .gemini を除外して、さらに「該当ファイル名だけ」出す
rg -n --files-with-matches `
  -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/.gemini/**' -g '!**/.next/**' -g '!**/build/**' `
  "users\.password|password_hash|facility_name|facilities\.user_id|\buser_id\b" .

2) facilities の INSERT/UPDATE は “ソースだけ”に限定
rg -n `
  -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/.gemini/**' `
  "INSERT INTO facilities|UPDATE facilities" server keamachi-api client

3) auth/supabase/useAuth も “src優先”
rg -n `
  -g '!**/node_modules/**' -g '!**/dist/**' -g '!**/.gemini/**' `
  "signUp|signIn|auth\.|supabase|useAuth" client/src keamachi-api/api server