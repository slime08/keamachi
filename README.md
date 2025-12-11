# ケアマチ - 福祉マッチングプラットフォーム

福祉サービス利用者と事業所をマッチングするWebアプリケーションです。

## 機能

### 利用者向け機能
- 事業所検索・詳細表示
- マッチング依頼
- メッセージング機能
- お気に入り・履歴管理

### 事業所向け機能
- 登録情報の管理・更新
- マッチング依頼の承認・拒否
- 利用者とのメッセージング
- 登録利用者管理

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

1.  **リポジトリのクローン**
    ```bash
    git clone <repository-url>
    cd Keamachi
    ```

2.  **環境設定ファイルの作成**
    ```bash
    cp .env.example .env
    ```
    `.env`ファイルを編集して、データベース接続情報などを設定します。

3.  **プロジェクトの依存関係のインストール**
    ```bash
    npm install
    cd client && npm install && cd ..
    cd keamachi-api && npm install && cd ..
    ```

4.  **データベースの初期化**
    PostgreSQLを起動し、`server/migrations/001_init.sql`を実行してください。
    ```bash
    psql -U postgres -d care_matching -f server/migrations/001_init.sql
    ```

5.  **アプリケーションの実行**
    ```bash
    npm run dev
    ```

    - フロントエンド: http://localhost:5173
    - バックエンド: http://localhost:3000

## プロジェクト構造

```
Keamachi/
├── client/                    # フロントエンド (React)
│   ├── src/
│   │   ├── pages/            # 各ページコンポーネント
│   │   ├── hooks/            # カスタムフック
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── keamachi-api/              # Vercel Serverless API
│   ├── api/                  # APIルート (TypeScript)
│   ├── lib/                  # ユーティリティ
│   ├── migrations/           # DBマイグレーション
│   ├── server.js             # ローカル開発用APIサーバー (Express)
│   └── package.json
├── server/                    # バックエンド (Express) - ローカル開発用 (非推奨・今後削除予定)
│   ├── routes/               # APIルート
│   ├── middleware/           # ミドルウェア
│   ├── migrations/           # DBマイグレーション
│   ├── db.ts                # DB接続管理
│   └── index.ts             # メインサーバー
├── .env.example             # 環境変数テンプレート
├── package.json             # ルートpackage.json
└── README.md               # このファイル
```

## APIエンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン

### 事業所
- `GET /api/facilities` - 事業所一覧
- `GET /api/facilities/:id` - 事業所詳細
- `POST /api/facilities` - 事業所作成 (要認証)

### ユーザー
- `GET /api/users/:id` - ユーザープロフィール
- `PUT /api/users/:id` - プロフィール編集 (要認証)

### マッチング
- `GET /api/matching/suggestions` - マッチング候補一覧
- `POST /api/matching` - マッチング依頼
- `PUT /api/matching/:id/accept` - マッチング承認

### メッセージング
- `GET /api/messages/conversation/:id` - メッセージ取得
- `POST /api/messages` - メッセージ送信

## 開発ガイド

### サーバーの起動
```bash
npm run server:dev
```

### クライアントの起動
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
- データベースが初期化されているか確認

### ポート競合
- ポート3000が使用中の場合、`.env`の`PORT`を別な値に変更
- ポート5173が使用中の場合、`client/vite.config.ts`を編集

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueをオープンして変更内容を議論してください。

## サポート

不具合報告やご質問は、GitHubのissueセクションでお問い合わせください。