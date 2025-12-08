# ケアマチ - 福祉マッチングアプリ

福祉関係の事業所と利用者をマッチングするWebアプリケーションです。

## 機能

### ユーザー向け機能
- 会員登録・ログイン
- 福祉事業所の検索・閲覧
- マッチング申し込み
- メッセージング機能
- レビュー・評価

### 事業所向け機能
- プロフィール登録・管理
- マッチング申し込みの確認・承認
- ユーザーとのメッセージング
- レビューの確認

## 技術スタック

### バックエンド
- **ランタイム**: Node.js
- **フレームワーク**: Express.js
- **言語**: TypeScript
- **データベース**: PostgreSQL
- **認証**: JWT (JSON Web Token)
- **リアルタイム**: Socket.io

### フロントエンド
- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **HTTPクライアント**: Axios
- **リアルタイムクライアント**: Socket.io Client

## インストール

### 前提条件
- Node.js 18+
- PostgreSQL 12+
- npm または yarn

### セットアップ手順

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd ケアマチ
```

2. **環境設定ファイルの作成**
```bash
cp .env.example .env
```
`.env`ファイルを編集して、データベース接続情報を設定します。

3. **依存パッケージのインストール**
```bash
npm install
cd client && npm install && cd ..
```

4. **データベースの初期化**
PostgreSQLを起動して、`server/migrations/001_init.sql`を実行します：
```bash
psql -U postgres -d care_matching -f server/migrations/001_init.sql
```

5. **開発サーバーの起動**
```bash
npm run dev
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:3000

## プロジェクト構造

```
ケアマチ/
├── client/                    # フロントエンド（React）
│   ├── src/
│   │   ├── pages/            # ページコンポーネント
│   │   ├── hooks/            # カスタムフック
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                    # バックエンド（Express）
│   ├── routes/               # APIルート
│   ├── middleware/           # ミドルウェア
│   ├── migrations/           # DBマイグレーション
│   ├── db.ts                # DB接続設定
│   ├── index.ts             # メインサーバー
│   └── package.json
├── .env.example             # 環境変数テンプレート
├── package.json             # ルートpackage.json
└── README.md               # このファイル
```

## API エンドポイント

### 認証
- `POST /api/auth/register` - 新規登録
- `POST /api/auth/login` - ログイン

### 事業所
- `GET /api/facilities` - 事業所一覧
- `GET /api/facilities/:id` - 事業所詳細
- `POST /api/facilities` - 事業所作成（認証必要）

### ユーザー
- `GET /api/users/:id` - ユーザープロフィール
- `PUT /api/users/:id` - プロフィール更新（認証必要）

### マッチング
- `GET /api/matching/suggestions` - マッチング提案一覧
- `POST /api/matching` - マッチング申し込み
- `PUT /api/matching/:id/accept` - マッチング承認

### メッセージ
- `GET /api/messages/conversation/:id` - メッセージ取得
- `POST /api/messages` - メッセージ送信

## 開発ガイド

### サーバーの実行
```bash
npm run server:dev
```

### クライアントの実行
```bash
npm run client:dev
```

### ビルド
```bash
npm run build
```

## トラブルシューティング

### データベース接続エラー
- PostgreSQLが起動しているか確認
- `.env`ファイルのデータベース接続情報を確認
- テーブルが作成されているか確認

### ポート競合
- ポート3000が使用中の場合、`.env`の`PORT`を変更
- ポート5173が使用中の場合、`client/vite.config.ts`を編集

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を説明してください。

## サポート

問題が発生した場合は、GitHubのissueセクションで報告してください。
