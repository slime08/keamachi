@echo off
echo ローカル環墁E��クリーンアチE�Eし、依存関係を再インスト�Eルします、E
echo --- client ---
cd client
if exist node_modules rmdir /s /q node_modules
if exist .vite rmdir /s /q .vite
echo npm install を実行中...
npm install
cd ..

echo --- keamachi-api ---
cd keamachi-api
if exist node_modules rmdir /s /q node_modules
echo npm install を実行中...
npm install
cd ..

echo --- server ---
cd server
if exist node_modules rmdir /s /q node_modules
echo npm install を実行中...
npm install
cd ..

echo --- フロントエンド開発サーバ�Eの起勁E---
echo.
echo 全ての依存関係�Eインスト�EルとクリーンアチE�Eが完亁E��ました、Eecho 新しいターミナルウィンドウを開き、以下�Eコマンドを実行してフロントエンドを起動してください:
echo    cd client
echo    npm run dev
echo.
echo こ�Eウィンドウを閉じるには、任意�Eキーを押してください、Epause
