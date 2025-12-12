# ケアマチ - 福祉マッチングアプリ

このプロジェクトは、福祉サービス利用者と事業所をマッチングするWebアプリケーションです。

## プロジェクト概要

- **名称**: ケアマチ - Care Matching
- **目的**: 福祉サービス利用者と事業所のマッチング
- **タイプ**: シングルページ Webアプリケーション
- **バックエンド**: Node.js + Express + TypeScript + PostgreSQL
- **フロントエンド**: React + TypeScript + Vite

## 主要機能

### 利用者向け
- 簡易登録・ログイン・JWT認証
- マッチング申請
- リアルタイムメッセージ
- 事業所のレビュー・評価

### 事業所向け
- プロフィール管理
- マッチング申請の承認・拒否
- 利用者とのコミュニケーション
- 利用状況の管理

## セットアップ手順

1. **開発環境の構築**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **環境設定ファイルの準備**
   ```bash
   cp .env.example .env
   ```
   `.envファイルを作成し、データベース接続情報などを設定します。

3. **データベースの初期化**
   PostgreSQLを起動し、server/migrations/001_init.sqlを実行してください。

4. **アプリケーションの実行**
   ```bash
   npm run dev
   ```

## プロジェクト構造

```
Keamachi/
├── client/                    # フロントエンド (React)
│   ├── src/
│   │   ├── pages/            # Auth.tsx, Dashboard.tsx
│   │   ├── hooks/            # useAuth.ts
│   │   ├── App.tsx
│   │   └── main.tsx
笏・  │   ├── index.html
│   ├── vite.config.ts
│   └── package.json
笏・  笏披楳笏 package.json
笏懌楳笏 server/                    # Express 繝舌ャ繧ｯ繧ｨ繝ｳ繝・
笏・  笏懌楳笏 routes/               # auth, facilities, users, matching, messages
笏・  笏懌楳笏 middleware/           # auth.ts
笏・  笏懌楳笏 migrations/           # 001_init.sql
笏・  笏懌楳笏 db.ts
笏・  笏懌楳笏 index.ts
│   └── index.ts
├── .env.example
├── package.json
└── README.md

```

## 髢狗匱譎ゅ・豕ｨ諢冗せ

- 繝輔Ο繝ｳ繝医お繝ｳ繝・ `localhost:5173`縺ｧ螳溯｡・
- 繝舌ャ繧ｯ繧ｨ繝ｳ繝・ `localhost:3000`縺ｧ螳溯｡・
- 繝・・繧ｿ繝吶・繧ｹ: PostgreSQL・医Ο繝ｼ繧ｫ繝ｫ縺ｾ縺溘・Docker・・
- JWT隱崎ｨｼ繧剃ｽｿ逕ｨ縺励※縺・ｋ縺溘ａ縲√ヨ繝ｼ繧ｯ繝ｳ譛牙柑譛滄剞縺ｫ豕ｨ諢・

## 繧ｳ繝槭Φ繝・

```bash
npm run dev           # 繝輔Ο繝ｳ繝茨ｼ九ヰ繝・け繧ｨ繝ｳ繝牙酔譎ょｮ溯｡・
npm run server:dev    # 繝舌ャ繧ｯ繧ｨ繝ｳ繝峨・縺ｿ螳溯｡・
npm run client:dev    # 繝輔Ο繝ｳ繝医お繝ｳ繝峨・縺ｿ螳溯｡・
npm run build         # 譛ｬ逡ｪ逕ｨ繝薙Ν繝・
npm run start         # 譛ｬ逡ｪ迺ｰ蠅・〒襍ｷ蜍・
```

## 莉雁ｾ後・螳溯｣・ｺ亥ｮ・

- AI 繝槭ャ繝√Φ繧ｰ謗ｨ螂ｨ讖溯・
- 鬮伜ｺｦ縺ｪ讀懃ｴ｢繝ｻ繝輔ぅ繝ｫ繧ｿ繝ｼ
- 謾ｯ謇輔＞繝ｻ隲区ｱよｩ溯・
- 邂｡逅・判髱｢繝繝・す繝･繝懊・繝・
- 繝｢繝舌う繝ｫ繧｢繝励Μ蟇ｾ蠢・
- 繝励ャ繧ｷ繝･騾夂衍
