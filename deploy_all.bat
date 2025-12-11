@echo off
chcp 65001 > nul
echo プロジェクト全体をデプロイします。

echo --- バックエンド (keamachi-api) を Vercel にデプロイ ---
echo 1. まず、Vercel CLIをインストールしていることを確認してください: npm install -g vercel
echo 2. Vercelにログインしてください: vercel login
echo 3. keamachi-api ディレクトリに移動し、デプロイコマンドを実行してください:
echo    cd keamachi-api
echo    vercel --prod
echo 4. Vercelから出力されるデプロイされたAPIのURLをメモしてください。
echo 5. Vercelダッシュボードでkeamachi-apiプロジェクトの環境変数(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)を設定してください。
echo.

echo --- フロントエンド (client) を GitHub Pages にデプロイ ---
echo 1. client/.env ファイルを開き、VITE_API_BASE_URL を上記でメモしたVercelのAPIのURLに更新してください。
echo    例: VITE_API_BASE_URL=https://your-vercel-keamachi-api-url.vercel.app
echo 2. client ディレクトリに移動し、デプロイコマンドを実行してください:
echo    cd client
echo    npm run deploy
echo 3. GitHub Pagesへのデプロイが完了したら、https://slime08.github.io/keamachi/ で動作確認してください。
echo.

echo 全てのデプロイ手順が画面に表示されました。
echo 上記の手順に従って、それぞれのコマンドを個別に実行してください。
pause