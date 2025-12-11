import os
import re
import shutil

# Custom replacements dictionary
REPLACEMENTS = {
    # General app names/phrases
    "繧ｱ繧｢繝槭メ": "ケアマチ",
    "繝ｭ繧ｰ繧｢繧ｦ繝・": "ログアウト",
    "繝ｭ繧ｰ繧｢繧ｦ繝・/button>": "ログアウト</button>", # Specific JSX tag + garbled text
    "繝ｭ繧ｰ繧｢繧ｦ...": "ログアウト", # Partial garbled text
    "縺薙■繧・": "こちら",

    # package.json related
    "遖冗･蛾未菫ゅ・莠区･ｭ謇縺ｨ蛻ｩ逕ｨ閠・髄縺代・繝・メ繝ｳ繧ｰ繧｢繝励Μ": "福祉事業所と利用者を繋ぐマッチングプラットフォーム",
    "遖冗･・": "福祉",

    # Dashboard.tsx specific
    "莠区･ｭ謇縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆": "事業所の読み込みに失敗しました",
    "繧ｱ繧｢繝槭メ - 遖冗･峨・繝・メ繝ｳ繧ｰ繧｢繝励Μ": "ケアマチ - 福祉マッチングプラットフォーム",
    "縺薙ｓ縺ｫ縺｡縺ｯ縲＋user.name}縺輔ｓ": "こんにちは、{user.name}さん",
    "事業所繧呈爾縺・": "事業所を探す", # Correcting a common pattern in buttons
    "繝槭ャ繝√Φ繧ｰ": "マッチング",
    "繝｡繝・そ繝ｼ繧ｸ": "メッセージ",
    "莠区･ｭ謇邂｡逅・": "事業所管理",
    "繧ｯ繝ｩ繧､繧｢繝ｳ繝育ｮ｡逅・": "クライアント管理",
    "譯井ｻｶ邂｡逅・": "ケース管理",
    "繝励Ο繝輔ぅ繝ｼ繝ｫ": "プロフィール",
    "蛻ｩ逕ｨ縺ｧ縺阪ｋ遖冗･我ｺ区･ｭ謇": "利用できる福祉事業所",
    "隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...": "読み込み中...",
    "場所: {facility.location}": "場所: {facility.location}",
    "繧ｵ繝ｼ繝薙せ: {facility.serviceType}": "サービス種別: {facility.serviceType}",
    "隧ｳ邏ｰ繧定ｦ九ｋ": "詳細を見る",
    "險育判逶ｸ隲・藤繝ｻ繧ｱ繧｢繝槭ロ繧ｸ繝｣繝ｼ蜷代￠縺ｮ繧ｯ繝ｩ繧､繧｢繝ｳ繝医Μ繧ｹ繝医→逶ｸ隲・ｮ｡逅・う繝ｳ繧ｿ繝ｼ繝輔ぉ繝ｼ繧ｹ・医ム繝溘・・峨・/p>": "承認済みクライアントのリストと、承認/拒否のオプションを表示します。",
    "繧ｱ繧｢繝励Λ繝ｳ繝ｻ險ｪ蝠剰ｨ育判縺ｪ縺ｩ縺ｮ譯井ｻｶ邂｡逅・ン繝･繝ｼ・医ム繝溘・陦ｨ遉ｺ・峨・/p>": "ケアプラン、医療記録などのケース管理インターフェースを表示します。",
    "蜷榊燕": "氏名",
    "繝｡繝ｼ繝ｫ": "メール",
    "繝ｦ繝ｼ繧ｶ繝ｼ繧ｿ繧､繝・": "ユーザー種別",
    "遖冗･我ｺ区･ｭ謇": "事業所",
    "繧ｵ繝ｼ繝薙せ蛻ｩ逕ｨ閠・": "サービス利用者",
    "莠区･ｭ謇蜷・": "事業所名",
    "繝励Ο繝輔ぅ繝ｼ繝ｫ繧堤ｷｨ髮・": "プロフィールを編集",

    # Auth.tsx specific
    "URL縺九ｉmode繧貞愛譁ｭ": "URLからmodeを判断",
    "繝・せ繝医Θ繝ｼ繧ｶ繝ｼ": "テストユーザー",
    "謇玖ｻｽ縺ｧ縺､縺ｪ縺後ｋ<br />遖冗･峨・繝・メ繝ｳ繧ｰ": "手軽でつながる<br />福祉マッチング",
    "繧ｷ繝ｳ繝励Ν縺ｪ繧ｹ繝・ャ繝励〒縺､∝茜逕ｨ閠・ｂ莠区･ｭ謇繧よｰ苓ｻｽ縺ｫ蛻ｩ逕ｨ髢句ｧ九〒縺阪∪縺吶・": "シンプルなステップで、利用者も事業所も気軽に利用開始できます。",
    "逋ｻ骭ｲ縺九ｉ蛻ｩ逕ｨ髢句ｧ九∪縺ｧ譛遏ｭ繧ｹ繝・ャ繝・": "登録から利用開始まで最短ステップ",
    "莠区･ｭ謇諠・ｱ縺ｯ隧ｳ邏ｰ蜈ｬ髢九〒謗｢縺励ｄ縺吶￥": "事業所情報は詳細公開で探しやすく",
    "繧ｱ繧｢繝槭ロ/逶ｸ隲・藤縺ｨ繧ゅせ繝繝ｼ繧ｺ縺ｫ": "ケアマネ/相談員ともスムーズに",
    "譁ｰ隕冗匳骭ｲ": "新規登録",
    "繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ": "メールアドレス",
    "繝代せ繝ｯ繝ｼ繝・": "パスワード",
    "繝代せ繝ｯ繝ｼ繝峨ｒ蜈･蜉・": "パスワードを入力",
    "豌丞錐": "氏名",
    "螻ｱ逕ｰ 螟ｪ驛・": "山田 太郎",
    "繝ｦ繝ｼ繧ｶ繝ｼ遞ｮ蛻･": "ユーザー種別",
    "謇ｿ隱肴ｸ医∩逶ｸ隲・藤": "認定相談員",
    "繧ｱ繧｢繝槭ロ繝ｼ繧ｸ繝｣繝ｼ": "ケアマネージャー",
    "萓・ 繧ｱ繧｢繝槭メ莉玖ｭｷ": "例: ケアマチ介護",
    "謇蝨ｨ蝨ｰ": "所在地",
    "萓・ 譚ｱ莠ｬ驛ｽ譁ｰ螳ｿ蛹ｺ1-2-3": "例: 東京都新宿区1-2-3",
    "繧ｵ繝ｼ繝薙せ遞ｮ蛻･": "サービス種別",
    "驕ｸ謚槭＠縺ｦ縺上□縺輔＞": "選択してください",
    "險ｪ蝠丈ｻ玖ｭｷ": "訪問介護",
    "繝・う繧ｵ繝ｼ繝薙せ": "デイサービス",
    "繧ｰ繝ｫ繝ｼ繝励・繝ｼ繝": "グループホーム",
    "髫懷ｮｳ遖冗･・": "障害福祉",
    "蜈千ｫ･遖冗･・": "児童福祉",
    "閠∽ｺｺ遖冗･・": "老人福祉",
    "髮ｻ隧ｱ逡ｪ蜿ｷ": "電話番号",
    "萓・ 03-1234-5678": "例: 03-1234-5678",
    "隱ｬ譏・": "説明",
    "莠区･ｭ謇縺ｮ迚ｹ蠕ｴ繧・署萓帙し繝ｼ繝薙せ繧貞・菴鍋噪縺ｫ蜈･蜉帙＠縺ｦ縺上□縺輔＞": "事業所の特徴や提供サービスを具体的に入力してください",
    "騾∽ｿ｡荳ｭ...": "送信中...",
    "繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲ゅ＠縺ｰ繧峨￥縺励※縺九ｉ蜀榊ｺｦ縺願ｩｦ縺励￥縺縺輔＞縲・": "エラーが発生しました。しばらくしてから再度お試しください。",
    
    # api.ts specific
    "繧・baseURL 縺ｫ莉倥￠繧・": "/api を baseURL に付ける",
    "繧定ｿｽ蜉 (縺薙ｌ縺後・繧､繝ｳ繝・": "を追加 (これがポイント)",
    "繝倥Ν繧ｹ繝√ぉ繝・け": "ヘルスチェック",
    "譁ｽ險ｭ荳隕ｧ": "施設一覧",

    # Home.tsx specific
    "SERVICE_OPTIONS 繧偵う繝ｳ繝昴・繝・": "SERVICE_OPTIONS をインポート",
    "繝翫ン繧ｲ繝ｼ繧ｷ繝ｧ繝ｳ繝舌・": "ナビゲーションバー",
    "笶､・・": "❤️", # This will be handled by custom regex for JSX
    "迚ｹ蠕ｴ": "特徴",
    "縺雁撫縺・粋繧上○": "お問い合わせ",
    "繝偵・繝ｭ繝ｼ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ": "ヒーローセクション",
    "遖冗･峨し繝ｼ繝薙せ縺ｨ蛻ｩ逕ｨ閠・ｒ<br />縺､縺ｪ縺舌Δ繝繝ｳ縺ｪ繝槭ャ繝√Φ繧ｰ": "福祉サービスと利用者を<br />つなぐモダンなマッチング",
    "雉ｪ縺ｮ鬮倥＞遖冗･峨し繝ｼ繝薙せ繧偵∝ｿ・ｦ√↑莠ｺ縺ｸ縺ｧ縲ゆｺ区･ｭ謇縺ｨ蛻ｩ逕ｨ閠・・譛驕ｩ縺ｪ繝槭ャ繝√Φ繧ｰ繧偵√す繝ｳ繝励Ν縺ｧ逶ｴ諢溽噪縺ｪ菴馴ｨ薙〒繧ｵ繝昴・繝医＠縺ｾ縺吶・/p>": "質の高い福祉サービスを、必要な人へ。事業所と利用者の最適なマッチングを、シンプルで直感的な体験でサポートします。</p>",
    "蛻ｩ逕ｨ閠・→縺励※逋ｻ骭ｲ": "利用者として登録",
    "莠区･ｭ謇縺ｨ縺励※逋ｻ骭ｲ": "事業所として登録",
    "繧ｱ繧｢繝槭メ縺ｮ蛻ｩ逕ｨ繧､繝｡繝ｼ繧ｸ": "ケアマチの利用イメージ",
    "莠区･ｭ謇蜷阪・菴乗園縺ｧ讀懃ｴ｢": "事業所名・住所で検索",
    "縺吶∋縺ｦ縺ｮ遞ｮ蛻･": "すべての種別",
    "讀懃ｴ｢": "検索",
    "縺吶∋縺ｦ": "すべて",
    "譛・": "月",
    "轣ｫ": "火",
    "豌ｴ": "水",
    "譛ｨ": "木",
    "驥・": "金",
    "蝨・": "土",
    "譌･": "日",
    "莠区･ｭ謇荳隕ｧ・医・繝ｼ繝縺ｧ陦ｨ遉ｺ・・": "事業所一覧（ホームで表示）",
    "莠区･ｭ謇荳隕ｧ": "事業所一覧",
    "迚ｹ蠕ｴ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ": "特徴セクション",
    "繧ｱ繧｢繝槭メ縺ｮ迚ｹ蠕ｴ": "ケアマチの特徴",
    "邁｡蜊俶､懃ｴ｢": "簡単検索",
    "菴乗園縲√し繝ｼ繝薙せ遞ｮ蛻･縺ｪ縺ｩ縲∵ｧ倥・↑譚｡莉ｶ縺九ｉ<br /> 縺ゅ↑縺溘↓蜷医▲縺滉ｺ区･ｭ謇繧堤ｰ｡蜊倥↓検索縺ｧ縺阪∪縺吶・/p>": "住所、サービス種別など、様々な条件から<br /> あなたに合った事業所を簡単に検索できます。</p>",
    "菫｡鬆ｼ縺ｧ縺阪ｋ隧穂ｾ｡": "信頼できる評価",
    "螳滄圀縺ｮ蛻ｩ逕ｨ閠・↓繧医ｋ隧ｳ邏ｰ縺ｪ繝ｬ繝薙Η繝ｼ縺ｧ縺､br /> 莠区･ｭ謇縺ｮ特徴縺御ｸ逶ｮ迸ｭ辟ｶ縺ｧ縺吶・/p>": "実際の利用者による詳細なレビューで、<br /> 事業所の特徴が一目瞭然です。</p>",
    "逶ｴ謗･繧・ｊ縺ｨ繧・": "直接やりとり",
    "繧｢繝励Μ蜀・Γ繝・そ繝ｼ繧ｸ縺ｧ莠区･ｭ謇縺ｨ<br /> 逶ｴ謗･繧ｳ繝溘Η繝九こ繝ｼ繧ｷ繝ｧ繝ｳ縺ｧ縺阪∪縺吶・/p>": "アプリ内メッセージで事業所と<br /> 直接コミュニケーションできます。</p>",
    "螳牙・縺ｧ遒ｺ螳・": "安全で確実",
    "縺吶∋縺ｦ縺ｮ諠・ｱ縺ｯ證怜捷蛹悶＆繧後・br /> 蛟倶ｺｺ諠・ｱ縺ｮ菫晁ｭｷ縺ｫ荳・・繧貞ｰｽ縺上＠縺ｦ縺・∪縺吶・/p>": "すべての情報は暗号化され、<br /> 個人情報の保護に万全を尽くしています。</p>",
    "繝槭ャ繝√Φ繧ｰ謾ｯ謠ｴ": "マッチング支援",
    "AI縺梧怙驕ｩ縺ｪ莠区･ｭ謇繧呈耳螂ｨ縺励・br /> 蜉ｹ邇・噪縺ｪ繝槭ャ繝√Φ繧ｰ繧偵し繝昴・繝医＠縺ｾ縺吶・/p>": "AIが最適な事業所を推奨し、<br /> 効率的なマッチングをサポートします。</p>",
    "24/7 蛻ｩ逕ｨ蜿ｯ閭ｽ": "24/7 利用可能",
    "縺・▽縺ｧ繧ゅ√←縺薙〒繧ゅ√せ繝槭・繝医ヵ繧ｩ繝ｳ縺九ｉ<br /> 莠区･ｭ謇諠・ｱ繧堤｢ｺ隱阪〒縺阪∪縺吶・/p>": "いつでも、どこでも、スマートフォンから<br /> 事業所情報を確認できます。</p>",
    "繧ｵ繝ｼ繝薙せ遞ｮ蛻･繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ": "サービス種別セクション",
    "謠蝉ｾ帙し繝ｼ繝薙せ": "提供サービス",
    "閾ｪ螳・〒縺ｮ逕滓ｴｻ謠ｴ蜉ｩ繧・ｺｫ菴謎ｻ玖ｭｷ": "自宅での生活援助や身体介護",
    "窶ｻ縺薙％縺ｯ繝繝溘・繝・く繧ｹ繝医ょｿ・ｦ√↓蠢懊§縺ｦ蜷・し繝ｼ繝薙せ縺ｮ隱ｬ譏弱ｒ霑ｽ蜉": "※ここはダミーテキスト。必要に応じて各サービスの説明を追加",
    "莠ｺ豌・/span>": "人気</span>", # This is emoji, handle with care or escape if needed in JSX
    "險ｪ蝠丈ｻ玖ｭｷ": "訪問介護",
    "莉翫☆縺舌こ繧｢繝槭メ繧貞ｧ九ａ縺ｾ縺励ｇ縺・/h2>": "今すぐケアマチを始めましょう",
    "雉ｪ縺ｮ鬮倥＞遖冗･峨し繝ｼ繝薙せ縺ｨ縺ｮ繝槭ャ繝√Φ繧ｰ縺ｯ縲√こ繧｢繝槭メ縺ｧ縺・/p>": "質の高い福祉サービスとのマッチングは、ケアマチで。</p>",
    "莠区･ｭ謇繧呈爾縺・/a>": "事業所を探す",
    "譁ｰ隕冗匳骭ｲ": "新規登録",
    "繝輔ャ繧ｿ繝ｼ": "フッター",
    "繧ｱ繧｢繝槭メ縺ｫ縺､縺・※": "ケアマチについて",
    "驕句霧莨夂､ｾ": "運営会社",
    "繝九Η繝ｼ繧ｹ": "ニュース",
    "繝悶Ο繧ｰ": "ブログ",
    "蛻ｩ逕ｨ閠・髄縺・/h4>": "利用者向け",
    "繧医￥縺ゅｋ雉ｪ蝠・/a>": "よくある質問",
    "菴ｿ縺・婿": "使い方",
    "繝ｬ繝薙Η繝ｼ譁ｹ豕・/a>": "レビュー方法",
    "莠区･ｭ謇蜷代￠": "事業所向け",
    "謗ｲ霈画婿豕・/a>": "掲載方法",
    "譁咎≡": "料金",
    "繧ｵ繝昴・繝・/a>": "サポート",
    "豕募漁": "法務",
    "繝励Λ繧､繝舌す繝ｼ": "プライバシー",
    "蛻ｩ逕ｨ隕冗ｴ・/a>": "利用規約",
    "迚ｹ螳壼膚蜿門ｼ墓ｳ・/a>": "特定商取引法",
    "&copy; 2025 繧ｱ繧｢繝槭メ. All rights reserved.": "&copy; 2025 ケアマチ. All rights reserved."
    
}

HOME_TSX_FIXED_CONTENT = r"""
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import BrowseFacilities from './Browse'
import { SERVICE_OPTIONS } from '../constants/services'; // SERVICE_OPTIONS をインポート

interface Facility {
  id: number
  name: string
  description: string
  location: string
  service_type: string
  rating?: number
  reviews?: number
  imageUrl?: string
  availability?: {
    mon: 'open' | 'limited' | 'closed'
    tue: 'open' | 'limited' | 'closed'
    wed: 'open' | 'limited' | 'closed'
    thu: 'open' | 'limited' | 'closed'
    fri: 'open' | 'limited' | 'closed'
    sat: 'open' | 'limited' | 'closed'
    sun: 'open' | 'limited' | 'closed'
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedWeekday, setSelectedWeekday] = useState<'all'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>('all')

  return (
    <div className="home-page">
      {/* ナビゲーションバー */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">❤️</span>
            <span className="logo-text">ケアマチ</span>
          </div>
          <div className="nav-links">
            <a href="#features">特徴</a>
            <a href="#services">サービス</a>
            <a href="#contact">お問い合わせ</a>
            <Link to="/login" className="nav-login">ログイン</Link>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1>福祉サービスと利用者を<br />つなぐモダンなマッチング</h1>
            <p>質の高い福祉サービスを、必要な人へ。事業所と利用者の最適なマッチングを、シンプルで直感的な体験でサポートします。</p>
            <div className="hero-buttons">
              <Link to="/register?role=user" className="btn btn-primary">利用者として登録</Link>
              <Link to="/register?role=facility" className="btn btn-secondary">事業所として登録</Link>
            </div>
          </div>
          <div className="hero-illustration card">
            <img
              src="/keamachi/LP.png"
              alt="ケアマチの利用イメージ"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Search card overlapping hero */}
      <div className="container search-card">
        <div className="search-row">
          <input type="text" placeholder="事業所名・住所で検索" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{flex:1}} />
          <select value={selectedService} onChange={e=>setSelectedService(e.target.value)}>
            <option value="all">すべての種別</option>
            {SERVICE_OPTIONS.map(service => (
              <option key={service.key} value={service.label}>{service.label}</option>
            ))}
          </select>
          <button className="btn btn-primary">検索</button>
        </div>
        <div className="weekday-toggle weekday-filter">
          {[['all','すべて'],['mon','月'],['tue','火'],['wed','水'],['thu','木'],['fri','金'],['sat','土'],['sun','日']].map(([k,label])=> (
            <button key={k} onClick={()=>setSelectedWeekday(k as any)} className={selectedWeekday===k ? 'btn btn-primary' : 'btn btn-ghost'}>{label}</button>
          ))}
        </div>
      </div>
      
          {/* 事業所一覧（ホームで表示） */}
          <section className="container featured-section" style={{paddingTop:24}}>
            <h2>事業所一覧</h2>
            <BrowseFacilities initialSearch={searchQuery} initialService={selectedService} initialLocation={selectedLocation} initialWeekday={selectedWeekday} showControls={false} />
          </section>

      {/* 特徴セクション */}
      <section id="features" className="features">
        <div className="container">
          <h2>ケアマチの特徴</h2>
          <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>簡単検索</h3>
            <p>住所、サービス種別など、様々な条件から<br />
               あなたに合った事業所を簡単に検索できます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>信頼できる評価</h3>
            <p>実際の利用者による詳細なレビューで、<br />
               事業所の特徴が一目瞭然です。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>直接やりとり</h3>
            <p>アプリ内メッセージで事業所と<br />
               直接コミュニケーションできます。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>安全で確実</h3>
            <p>すべての情報は暗号化され、<br />
               個人情報の保護に万全を尽くしています。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>マッチング支援</h3>
            <p>AIが最適な事業所を推奨し、<br />
               効率的なマッチングをサポートします。</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>24/7 利用可能</h3>
            <p>いつでも、どこでも、スマートフォンから<br />
               事業所情報を確認できます。</p>
          </div>
          </div>
        </div>
      </section>

      {/* サービス種別セクション */}
      <section id="services" className="services">
        <div className="container">
          <h2>提供サービス</h2>
          <div className="services-grid">
            {SERVICE_OPTIONS.map(service => (
              <div key={service.key} className="service-item">
                <h3>{service.label}</h3>
                <p>自宅での生活援助や身体介護</p> {/* ※ここはダミーテキスト。必要に応じて各サービスの説明を追加 */}
                {service.key === 'home_care' && <span className="badge">人気</span>} {/* '訪問介護' にのみ「人気」バッジを表示 */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="cta">
        <div className="container">
          <h2>今すぐケアマチを始めましょう</h2>
          <p>質の高い福祉サービスとのマッチングは、ケアマチで。</p>
          <div className="cta-buttons">
            <a href="/browse" className="btn btn-large btn-primary">事業所を探す</a>
            <a href="/register" className="btn btn-large btn-secondary">新規登録</a>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="footer">
        <div className="footer-content container">
          <div className="footer-section">
            <h4>ケアマチについて</h4>
            <ul>
              <li><a href="#">運営会社</a></li>
              <li><a href="#">ニュース</a></li>
              <li><a href="#">ブログ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>利用者向け</h4>
            <ul>
              <li><a href="#">よくある質問</a></li>
              <li><a href="#">使い方</a></li>
              <li><a href="#">レビュー方法</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>事業所向け</h4>
            <ul>
              <li><a href="#">掲載方法</a></li>
              <li><a href="#">料金</a></li>
              <li><a href="#">サポート</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>法務</h4>
            <ul>
              <li><a href="#">プライバシー</a></li>
              <li><a href="#">利用規約</a></li>
              <li><a href="#">特定商取引法</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ケアマチ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
"""

def process_file_content(file_path):
    print(f"Processing content for {file_path}...")
    try:
        # Read raw content to handle various encodings gracefully
        raw_content = open(file_path, 'rb').read()
        
        # Try decoding with utf-8 first (most common for web projects), then fallbacks
        content = None
        try:
            content = raw_content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                content = raw_content.decode('shift_jis') # Common for Japanese Windows
            except UnicodeDecodeError:
                import chardet # Fallback to chardet if basic decoding fails
                detection = chardet.detect(raw_content)
                if detection and detection['confidence'] > 0.8:
                    content = raw_content.decode(detection['encoding'])
                else:
                    raise Exception("Could not reliably detect encoding.")

        # Apply corrections
        corrected_content = content
        for garbled, correct in REPLACEMENTS.items():
            corrected_content = corrected_content.replace(garbled, correct)
        
        # Special handling for Home.tsx: overwrite entirely
        if "Home.tsx" in file_path:
            corrected_content = HOME_TSX_FIXED_CONTENT
            
        # Specific JSX corrections for Dashboard.tsx
        if "Dashboard.tsx" in file_path:
            # The problematic line was identified as <p>読み込み中...</p> {/* Corrected */}
            # It seems the previous regex left {} which esbuild dislikes
            corrected_content = corrected_content.replace('<p>読み込み中...</p> {}', '<p>読み込み中...</p>')
            
        if "Browse.tsx" in file_path:
            # Fix services array garbled text
            # The pattern from the error log: '閠∝▼譁ｽ險ｭ', '髫懷ｮｳ福祉, '蜈千ｫ･福祉]
            # Expected: ['訪問介護', 'デイサービス', 'グループホーム', '老健施設', '障害福祉', '児童福祉']
            # Using re.sub for a more robust match against potentially varied garbled strings in the array
            corrected_content = re.sub(
                r"const services = \[\\s*'[^']+',\\s*'[^']+',\\s*'[^']+',\\s*'[^']+',\\s*'[^']+',\\s*'[^']+'\\s*\]",
                r"const services = ['訪問介護', 'デイサービス', 'グループホーム', '老健施設', '障害福祉', '児童福祉']",
                corrected_content
            )

        # Write back as BOM-less UTF-8
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(corrected_content)
        print(f"Successfully corrected content and re-encoded {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def run_fix_script():
    # List of files to explicitly correct their content
    files_to_explicitly_correct = [
        os.path.join('client', 'src', 'api.ts'),
        os.path.join('client', 'src', 'pages', 'Auth.tsx'),
        os.path.join('client', 'src', 'pages', 'Dashboard.tsx'),
        os.path.join('client', 'src', 'pages', 'Home.tsx'),
        os.path.join('client', 'src', 'constants', 'services.ts'),
        os.path.join('client', 'src', 'pages', 'Browse.tsx'), # Added Browse.tsx
        'package.json' # Root package.json
    ]

    for file_path in files_to_explicitly_correct:
        if os.path.exists(file_path):
            process_file_content(file_path)
        else:
            print(f"File not found: {file_path}")

    # Additionally, ensure all other .ts, .tsx, .js, .css files in client/src are BOM-less UTF-8
    # This covers any files not explicitly listed above but potentially affected by encoding
    print("\nEnsuring all other client/src files are BOM-less UTF-8...")
    for root, _, files in os.walk(os.path.join('client', 'src')):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.css')):
                file_path = os.path.join(root, file)
                # Only process if not already explicitly corrected
                if file_path not in files_to_explicitly_correct:
                    try:
                        raw_content = open(file_path, 'rb').read()
                        
                        # Check for BOM and remove if present
                        if raw_content.startswith(b'\xef\xbb\xbf'):
                            content_without_bom = raw_content[3:].decode('utf-8')
                            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                                f.write(content_without_bom)
                            print(f"Removed BOM and re-encoded {file_path}")
                        else:
                            # Just re-encode to ensure consistency, even if no BOM
                            content = raw_content.decode('utf-8')
                            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                                f.write(content)
                            print(f"Ensured {file_path} is BOM-less UTF-8 (no BOM found)")
                    except UnicodeDecodeError:
                        print(f"Warning: Could not decode {file_path} as UTF-8. Trying Shift-JIS...")
                        try:
                            content = raw_content.decode('shift_jis')
                            with open(file_path, 'w', encoding='utf-8', newline='') as f:
                                f.write(content)
                            print(f"Re-encoded {file_path} from Shift-JIS to BOM-less UTF-8")
                        except Exception as e:
                            print(f"Error re-encoding {file_path} from Shift-JIS: {e}")
                    except Exception as e:
                        print(f"Error re-encoding {file_path}: {e}")

    print("\nAll specified files processed. Please try running 'npm run dev' again.")

if __name__ == '__main__':
    run_fix_script()