// client/src/pages/Auth.tsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../api'
import { safeSetJSON } from '../utils/storage'
import { useAuth } from '../contexts/AuthProvider'
import { SERVICE_OPTIONS } from '../constants/services'
import { JAPANESE_PREFECTURES } from '../constants/prefectures'

const WEEK_DAYS = ['月', '火', '水', '木', '金', '土', '日'] as const
type WeekDay = (typeof WEEK_DAYS)[number]

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  email: string
  password: string
  name: string
  role: 'facility' | 'user' | 'planner' | 'care_manager'

  // 共通
  phone_number: string

  // user
  user_type?: '本人' | '家族・支援者'
  desired_services?: string[]

  // facility（登録画面では使うが、/auth/register に送るのは facility_name だけにする想定）
  facility_name?: string
  facility_prefecture?: string
  facility_city?: string
  facility_phone?: string
  facility_description?: string
  facility_service_types?: string[]
  capacity?: string
  operating_days?: WeekDay[]
  shuttle_service?: boolean
  lunch_provided?: boolean
  trial_booking_available?: boolean
  pc_work_available?: boolean
}

function digitsOnly(v: string) {
  return (v ?? '').replace(/[^\d]/g, '')
}

/**
 * 方法①：role別に payload を組み立てる（余計なキーを送らない）
 * - user: email/password/name/role/phone_number/user_type/desired_services
 * - facility: email/password/name/role/phone_number/facility_name
 * - planner/care_manager: email/password/name/role/phone_number
 */
function buildRegisterPayload(data: RegisterFormData) {
  const base = {
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
    phone_number: digitsOnly(data.phone_number),
  }

  if (data.role === 'user') {
    return {
      ...base,
      user_type: data.user_type,
      desired_services: data.desired_services ?? [],
    }
  }

  if (data.role === 'facility') {
    return {
      ...base,
      facility_name: data.facility_name,
    }
  }

  return base
}

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const initialRegister: RegisterFormData = useMemo(
    () => ({
      email: '',
      password: '',
      name: '',
      role: 'user',
      phone_number: '',
      user_type: '本人',
      desired_services: [],
      facility_name: '',
      facility_prefecture: '',
      facility_city: '',
      facility_service_types: [],
      facility_phone: '',
      facility_description: '',
      capacity: '',
      operating_days: [],
      shuttle_service: false,
      lunch_provided: false,
      trial_booking_available: false,
      pc_work_available: false,
    }),
    []
  )

  const [formData, setFormData] = useState<LoginFormData | RegisterFormData>(
    isLogin ? { email: '', password: '' } : initialRegister
  )

  // /login or /register に追従
  useEffect(() => {
    const nowLogin = location.pathname === '/login'
    setIsLogin(nowLogin)
    setError('')
    setFormData(nowLogin ? { email: '', password: '' } : initialRegister)
  }, [location.pathname, initialRegister])

  // /register?role=user|facility に追従
  useEffect(() => {
    if (isLogin) return
    const params = new URLSearchParams(location.search)
    const role = params.get('role')
    if (!role) return

    setFormData((prev) => {
      const p = prev as RegisterFormData
      return {
        ...p,
        role: role === 'facility' ? 'facility' : 'user',
      }
    })
  }, [location.search, isLogin])

  // input/select/textarea をまとめて処理（checked警告を潰す）
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target

    // checkbox
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const { name, checked } = target
      setFormData((prev) => ({ ...(prev as any), [name]: checked }))
      return
    }

    // radio
    if (target instanceof HTMLInputElement && target.type === 'radio') {
      const { name, value } = target
      setFormData((prev) => ({ ...(prev as any), [name]: value }))
      return
    }

    // text/select/textarea
    const { name, value } = target

    // 電話番号は数字だけに整形（ハイフン等除去）
    if (name === 'phone_number' || name === 'facility_phone') {
      setFormData((prev) => ({ ...(prev as any), [name]: digitsOnly(value) }))
      return
    }

    setFormData((prev) => ({ ...(prev as any), [name]: value }))
  }

  // 複数選択（checkbox）用
  const handleMultiSelect = (name: keyof RegisterFormData, value: string, checked: boolean) => {
    setFormData((prev) => {
      const p = prev as RegisterFormData
      const current = (p[name] as string[] | undefined) ?? []
      const next = checked ? [...current, value] : current.filter((x) => x !== value)
      return { ...p, [name]: next }
    })
  }

  // operating_days は WeekDay 型で安全に
  const handleMultiSelectWeekDays = (value: WeekDay, checked: boolean) => {
    setFormData((prev) => {
      const p = prev as RegisterFormData
      const current = p.operating_days ?? []
      const next = checked ? [...current, value] : current.filter((d) => d !== value)
      return { ...p, operating_days: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
        // login
        if (isLogin) {
          const data = formData as LoginFormData
          await login(data.email, data.password)   // ★これが本体
          navigate('/', { replace: true })
          return
        }
      // register
      const rData = formData as RegisterFormData

      // 最低限のフロント側チェック（サーバ側Joiが本命）
      if (!rData.email || !rData.email.includes('@') || rData.email.length < 5) {
        setError('有効なメールアドレスを入力してください。')
        return
      }
      if (!rData.password || rData.password.length < 6) {
        setError('パスワードは6文字以上で入力してください。')
        return
      }
      if (!rData.name || rData.name.trim().length < 2) {
        setError('氏名は2文字以上で入力してください。')
        return
      }
      if (!rData.phone_number || digitsOnly(rData.phone_number).length < 10) {
        setError('電話番号は数字のみで10〜11桁入力してください。')
        return
      }

      if (rData.role === 'user') {
        if (!rData.user_type) {
          setError('利用対象を選択してください。')
          return
        }
        if (!rData.desired_services || rData.desired_services.length === 0) {
          setError('希望サービス種別を最低1つ選択してください。')
          return
        }
      }

      if (rData.role === 'facility') {
        // まずは利用者登録を終わらせたい、とのことなので
        // ここは “最低限” のチェックに留める（必要なら後で強化）
        if (!rData.facility_name || rData.facility_name.trim().length < 2) {
          setError('事業所名は2文字以上で入力してください。')
          return
        }
      }

      // ✅ 方法①：role別payload
      const payload = buildRegisterPayload(rData)

      const response = await api.post('/auth/register', payload, { timeout: 5000 })

      localStorage.setItem('token', response.data.token)
      safeSetJSON('user', response.data.user)

      // facility 詳細の登録（必要なら）
      // ※「今は利用者登録を終わらせたい」なら、ここは一旦コメントアウトでもOK
      if (rData.role === 'facility') {
        try {
          await api.post(
            '/facilities',
            {
              name: rData.facility_name,
              address: `${rData.facility_prefecture ?? ''}${rData.facility_city ?? ''}`,
              serviceType: (rData.facility_service_types ?? [])[0] ?? '',
              services: rData.facility_service_types ?? [],
              phone: rData.facility_phone ?? '',
              description: rData.facility_description ?? '',
              capacity: rData.capacity ?? '',
              operatingDays: rData.operating_days ?? [],
              shuttleService: rData.shuttle_service ?? false,
              lunchProvided: rData.lunch_provided ?? false,
              trialBookingAvailable: rData.trial_booking_available ?? false,
              pcWorkAvailable: rData.pc_work_available ?? false,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            }
          )
        } catch (facilityErr) {
          // 事業所詳細登録失敗でもログイン状態は作れてるので、ここでは止めない
          if (import.meta.env.DEV) console.error('Failed to register facility details:', facilityErr)
        }
      }

      navigate('/', { replace: true })
    } catch (err: any) {
      if (import.meta.env.DEV && axios.isAxiosError(err)) {
        console.error('Auth error (DEV):', {
          method: err.config?.method,
          url: err.config?.url,
          status: err.response?.status,
          response_data: err.response?.data,
          message: err.message,
          code: err.code,
        })
      } else {
        console.error('Auth error:', err)
      }

      // サーバが {message:"..."} を返してる想定
      const serverMsg = err?.response?.data?.message
      if (typeof serverMsg === 'string' && serverMsg.length > 0) {
        setError(serverMsg)
        return
      }

      if (err.response && err.response.status === 409) {
        setError('このメールアドレスは既に登録されています。ログインしてください。')
      } else {
        setError(err.message || 'エラーが発生しました。しばらくしてから再度お試しください。')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    const nextIsLogin = !isLogin
    setIsLogin(nextIsLogin)
    navigate(nextIsLogin ? '/login' : '/register', { replace: true })
    setError('')
    setFormData(nextIsLogin ? { email: '', password: '' } : initialRegister)
  }

  const rData = formData as RegisterFormData

  return (
    <div className="auth-container">
      <div className="auth-shell">
        <div className="auth-hero">
          <span className="pill">ケアマチ</span>
          <h2>
            手軽でつながる
            <br />
            福祉マッチング
          </h2>
          <p className="auth-lead">シンプルなステップで、利用者も事業所も気軽に利用開始できます。</p>
          <ul className="auth-points">
            <li>登録から利用開始まで最短ステップ</li>
            <li>事業所情報は詳細公開で探しやすく</li>
            <li>ケアマネ/相談員ともスムーズに</li>
          </ul>
        </div>

        <div className="auth-form">
          <h1>{isLogin ? 'ログイン' : '新規登録'}</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                name="email"
                value={(formData as any).email}
                onChange={handleChange}
                required
                placeholder="test@example.com"
              />
            </div>

            <div className="form-group">
              <label>パスワード</label>
              <input
                type="password"
                name="password"
                value={(formData as any).password}
                onChange={handleChange}
                required
                placeholder="パスワードを入力"
              />
            </div>

            {!isLogin && (
              <div>
                <div className="form-group">
                  <label>氏名</label>
                  <input
                    type="text"
                    name="name"
                    value={rData.name || ''}
                    onChange={handleChange}
                    required
                    placeholder="山田 太郎"
                  />
                </div>

                <div className="form-group">
                  <label>ユーザー種別</label>
                  <select name="role" value={rData.role} onChange={handleChange} required>
                    <option value="user">サービス利用者</option>
                    <option value="facility">事業所</option>
                    <option value="planner">認定相談員</option>
                    <option value="care_manager">ケアマネージャー</option>
                  </select>
                </div>

                <div className="warning-message">
                  <p>実在確認と安全なマッチングのため、一部情報の入力をお願いしています。</p>
                </div>

                <div className="form-group">
                  <label>電話番号 (必須)</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={rData.phone_number || ''}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    placeholder="例: 09012345678"
                  />
                  <p className="note">※事業所には公開されません</p>
                </div>

                {/* 利用者の追加項目 */}
                {rData.role === 'user' && (
                  <>
                    <div className="form-group">
                      <label>利用対象</label>
                      <div className="radio-group">
                        <label>
                          <input
                            type="radio"
                            name="user_type"
                            value="本人"
                            checked={rData.user_type === '本人'}
                            onChange={handleChange}
                          />
                          本人
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="user_type"
                            value="家族・支援者"
                            checked={rData.user_type === '家族・支援者'}
                            onChange={handleChange}
                          />
                          家族・支援者
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>希望サービス種別 (複数選択可)</label>
                      <div className="checkbox-group">
                        {SERVICE_OPTIONS.map((service) => (
                          <label key={service.key} className="checkbox-item">
                            <input
                              type="checkbox"
                              value={service.label}
                              checked={rData.desired_services?.includes(service.label) || false}
                              onChange={(e) =>
                                handleMultiSelect('desired_services', service.label, e.currentTarget.checked)
                              }
                            />
                            {service.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 事業所の追加項目 */}
                {rData.role === 'facility' && (
                  <div>
                    <div className="form-group">
                      <label>事業所名 (必須)</label>
                      <input
                        type="text"
                        name="facility_name"
                        value={rData.facility_name || ''}
                        onChange={handleChange}
                        required
                        placeholder="例: ケアマチ介護"
                      />
                    </div>

                    <div className="form-group">
                      <label>所在地（都道府県）(必須)</label>
                      <select
                        name="facility_prefecture"
                        value={rData.facility_prefecture || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">都道府県を選択してください</option>
                        {JAPANESE_PREFECTURES.map((pref) => (
                          <option key={pref} value={pref}>
                            {pref}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>所在地（市区町村）(必須)</label>
                      <input
                        type="text"
                        name="facility_city"
                        value={rData.facility_city || ''}
                        onChange={handleChange}
                        required
                        placeholder="例: 新宿区"
                      />
                    </div>

                    <div className="form-group">
                      <label>事業所種別 (複数選択可) (必須)</label>
                      <div className="checkbox-group">
                        {SERVICE_OPTIONS.map((service) => (
                          <label key={service.key} className="checkbox-item">
                            <input
                              type="checkbox"
                              value={service.label}
                              checked={rData.facility_service_types?.includes(service.label) || false}
                              onChange={(e) =>
                                handleMultiSelect('facility_service_types', service.label, e.currentTarget.checked)
                              }
                            />
                            {service.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>電話番号 (必須)</label>
                      <input
                        type="tel"
                        name="facility_phone"
                        value={rData.facility_phone || ''}
                        onChange={handleChange}
                        required
                        inputMode="numeric"
                        placeholder="例: 0312345678"
                      />
                    </div>

                    <div className="form-group">
                      <label>定員 (必須)</label>
                      <input
                        type="number"
                        name="capacity"
                        value={rData.capacity || ''}
                        onChange={handleChange}
                        required
                        placeholder="例: 30"
                      />
                    </div>

                    <div className="form-group">
                      <label>対応曜日 (必須)</label>
                      <div className="checkbox-group">
                        {WEEK_DAYS.map((day) => (
                          <label key={day} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={rData.operating_days?.includes(day) || false}
                              onChange={(e) => handleMultiSelectWeekDays(day, e.currentTarget.checked)}
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>その他サービス</label>
                      <div className="checkbox-group">
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            name="shuttle_service"
                            checked={rData.shuttle_service || false}
                            onChange={handleChange}
                          />
                          送迎あり
                        </label>
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            name="lunch_provided"
                            checked={rData.lunch_provided || false}
                            onChange={handleChange}
                          />
                          昼食あり
                        </label>
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            name="trial_booking_available"
                            checked={rData.trial_booking_available || false}
                            onChange={handleChange}
                          />
                          見学予約可
                        </label>
                        <label className="checkbox-item">
                          <input
                            type="checkbox"
                            name="pc_work_available"
                            checked={rData.pc_work_available || false}
                            onChange={handleChange}
                          />
                          PC作業あり
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>説明</label>
                      <textarea
                        name="facility_description"
                        value={rData.facility_description || ''}
                        onChange={handleChange}
                        placeholder="事業所の特徴や提供サービスを具体的に入力してください"
                        rows={3}
                        className="textarea"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? '送信中...' : isLogin ? 'ログイン' : '登録'}
            </button>
          </form>

          <p className="toggle-text">
            {isLogin ? '新規登録は' : 'ログインは'}
            <button type="button" onClick={toggleMode} className="toggle-button">
              こちら
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
