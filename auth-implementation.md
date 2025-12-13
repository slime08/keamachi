# Keamachi 認証システム設計（確定版）

## 1. 背景と目的

Keamachi は現在 Supabase（PostgreSQL）を利用しているが、  
将来的に **VPS + 自前DB** への移行や **外部認証（Google / OIDC 等）** の導入を見据え、  
特定の認証サービスに依存しない認証基盤を採用する。

本設計では以下を目的とする：

- Supabase Auth に依存しない
- DB 接続先変更に強い
- 認証方式の差し替えが可能
- フロントエンドが認証方式を意識しない
- 仮成功（mock token / mock user）を使わない

---

## 2. 設計方針（原則）

- 認証は **アプリケーション独自実装**
- パスワード認証は **bcrypt + JWT**
- 認証方式は将来差し替え可能な構造
- DB は PostgreSQL を前提とするが、特定サービスに依存しない
- Supabase は「PostgreSQL ホスティング」としてのみ利用

---

## 3. データベース設計

### 3.1 users テーブル（認証・ユーザー属性）

users テーブルは **認証・ユーザー属性・role のみ** を責務とする。  
事業所名などのドメイン情報は facilities テーブルに分離する。

#### カラム概要

- `id`  
  - UUID（アプリケーション上の唯一のユーザー識別子）
  - 認証方式に依存しない

- `email`  
  - メールアドレス（UNIQUE / NOT NULL）

- `password_hash`  
  - ローカル認証用パスワードハッシュ
  - 外部認証ユーザーの場合は NULL 可

- `auth_provider`  
  - 認証方式識別子  
  - 例：`local`, `google`, `oidc`

- `provider_id`  
  - 外部認証プロバイダから取得したユーザーID
  - `(auth_provider, provider_id)` の組み合わせで一意

- `role`  
  - ユーザーの役割  
  - 例：`user`, `facility`, `admin`, `planner`, `care_manager`

- `name`  
  - ユーザー名 / 事業所担当者名

- `phone_number`  
  - 電話番号

- `user_type`  
  - 利用対象（例：本人 / 家族・支援者）  
  - role = `user` の場合に使用

- `desired_services`  
  - 希望サービス種別（JSONB / 文字列配列）
  - role = `user` の場合に使用

- `created_at`, `updated_at`

#### 設計上のポイント

- `facility_name` は **users に持たせない**
- users は「認証と人物情報」のみを管理
- 事業所の実体情報は facilities に集約

---

### 3.2 facilities テーブル（事業所情報）

facilities テーブルは **事業所そのものの情報** を管理する。

#### カラム概要

- `id`  
  - 事業所ID（UUID）

- `user_id`  
  - users.id と 1:1 紐付け  
  - role = `facility` のユーザーのみ対象  
  - users 削除時は CASCADE

- `name`  
  - 事業所名（唯一の正）

- `prefecture`, `city`, `address_detail`

- `phone`, `email`, `website`

- `description`

- `service_types`  
  - 提供サービス種別（JSONB / 文字列配列）

- `capacity`

- `operating_days`

- `shuttle_service`, `lunch_provided`,
  `trial_booking_available`, `pc_work_available`

- `image_url`, `rating`, `reviews`

- `created_at`, `updated_at`

---

## 4. 認証フロー設計

### 4.1 登録（POST /api/auth/register）

1. **バリデーション**
   - Joi による検証
   - role に応じた必須項目チェック
   - エラー時：400 Bad Request

2. **重複チェック**
   - users.email の重複確認
   - 存在時：409 Conflict

3. **パスワード処理**
   - bcrypt によるハッシュ化

4. **DB保存**
   - users テーブルに基本情報のみ保存
   - 事業所詳細はこの段階では保存しない

5. **JWT発行**
   - payload: `id`, `email`, `role`
   - 有効期限付き

6. **レスポンス**
   - 成功：201 Created + user + token
   - 失敗：400 / 409 / 500

---

### 4.2 ログイン（POST /api/auth/login）

1. users.email でユーザー取得
2. 存在しない場合：401 Unauthorized
3. bcrypt.compare でパスワード照合
4. 不一致：401 Unauthorized
5. JWT発行
6. 成功：200 OK + user + token

---

### 4.3 認証済みAPI

- Authorization ヘッダから JWT を取得
- jsonwebtoken.verify で検証
- payload から `id`, `email`, `role` を取得
- `req.user` に格納して後続処理で使用

---

## 5. JWT 設計

### ペイロード（最小限）

- `id`
- `email`
- `role`

### JWT の責務

- 認証（Authentication）
- ロールベース認可（Authorization）

### 注意点

- JWT は肥大化させない
- 詳細権限は API 側ロジックで判断

---

## 6. フロントエンドの責務

### フロントが信じるもの

- API の成功 / 失敗
- JWT は不透明なトークンとして扱う

### フロントがやらないこと

- JWT の中身解析
- 認証ロジックの判断

### token 保存

- localStorage を使用（現段階）
- UI状態維持のための保存に限定
- 真の認証状態は常に API 側で保証

### エラー時の挙動

- API エラー時は navigate しない
- error state に message をセットして表示
- setLoading(false) は finally で必ず実行
- 開発中は Axios エラー詳細を console.error に出力

---

## 7. JSONB カラムの方針

### 対象

- users.desired_services
- facilities.service_types

### 採用理由

- 実装コストが低い
- 要件変化に柔軟
- 現段階で複雑な検索要件がない

### 将来の移行

- 高頻度検索や集計が必要になった場合
- 中間テーブル（多対多）へ正規化可能
- 現設計は移行を阻害しない

---

## 8. 将来の外部認証（Google / OIDC）

### 変わる部分

- auth_provider / provider_id の利用
- password_hash は NULL
- 外部認証用 API エンドポイント追加

### 変わらない部分

- users / facilities のコア構造
- JWT 発行・検証モデル
- フロントの基本的な認証フロー

---

## 9. 結論

本設計は以下を満たす：

- Supabase 依存なし
- DB 接続先変更に強い
- 外部認証へ段階的に移行可能
- フロントが認証方式を意識しない
- 仮成功処理を排除

**この設計で最小実装フェーズへ進んで問題なし。**
