# ケアマチ - 福祉マッチングアプリ

このプロジェクトは、福祉関係の事業所とサービス利用者をマッチングするフルスタックWebアプリケーションです。

## プロジェクト概要

- **名前**: ケアマチ（Care Matching）
- **目的**: 福祉事業所と利用者のマッチング
- **タイプ**: フルスタック Webアプリケーション
- **バックエンド**: Node.js + Express + TypeScript + PostgreSQL
- **フロントエンド**: React + TypeScript + Vite

## 主要機能

### ユーザー向け
- 会員登録・ログイン（JWT認証）
- 福祉事業所の検索・閲覧
- マッチング申し込み
- リアルタイムメッセージング
- 事業所のレビュー・評価

### 事業所向け
- プロフィール管理
- マッチング申し込みの確認・承認
- ユーザーとのコミュニケーション
- 利用者からのレビュー確認

## セットアップ手順

1. **依存パッケージのインストール**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```
   `.env`ファイルを編集してデータベース接続情報を設定します。

3. **データベースの初期化**
   PostgreSQLでデータベースを作成し、`server/migrations/001_init.sql`を実行します。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

## プロジェクト構成

```
ケアマチ/
├── client/                    # React フロントエンド
│   ├── src/
│   │   ├── pages/            # Auth.tsx, Dashboard.tsx
│   │   ├── hooks/            # useAuth.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                    # Express バックエンド
│   ├── routes/               # auth, facilities, users, matching, messages
│   ├── middleware/           # auth.ts
│   ├── migrations/           # 001_init.sql
│   ├── db.ts
│   ├── index.ts
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## 開発時の注意点

- フロントエンド: `localhost:5173`で実行
- バックエンド: `localhost:3000`で実行
- データベース: PostgreSQL（ローカルまたはDocker）
- JWT認証を使用しているため、トークン有効期限に注意

## コマンド

```bash
npm run dev           # フロント＋バックエンド同時実行
npm run server:dev    # バックエンドのみ実行
npm run client:dev    # フロントエンドのみ実行
npm run build         # 本番用ビルド
npm run start         # 本番環境で起動
```

## 今後の実装予定

- AI マッチング推奨機能
- 高度な検索・フィルター
- 支払い・請求機能
- 管理画面ダッシュボード
- モバイルアプリ対応
- プッシュ通知
