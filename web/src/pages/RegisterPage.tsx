import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'
import { useToast } from '../context/ToastContext'
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User,
  Users
} from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'citizen' | 'official'>('citizen')
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
          }
        }
      })

      if (error) {
        addToast('error', error.message)
      } else if (data.user) {
        addToast('success', 'Kayıt başarılı! Giriş yapabilirsiniz.')
        navigate('/login')
      }
    } catch (err: any) {
      addToast('error', err.message || 'Kayıt olurken bir hata oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen">
      {/* ── Sol Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-700/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-500/10 blur-3xl" />

        {/* Logo + Başlık */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Building2 className="w-7 h-7 text-accent-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              SmartCity
            </span>
          </div>
          <p className="text-primary-300 text-sm mt-1 ml-[3.75rem]">
            Akıllı Şehir & Yönetim Platformu
          </p>
        </div>

        {/* Bilgi kartları */}
        <div className="relative z-10 space-y-6">
          <InfoCard
            icon={<Users className="w-5 h-5 text-accent-400" />}
            title="Şehrinizi Daha İyi Yapın"
            desc="Problemleri bildirin, projeleri takip edin ve şehrinize katkı sağlayın."
          />
          <InfoCard
            icon={<Shield className="w-5 h-5 text-accent-400" />}
            title="Güvenli ve Hızlı"
            desc="Kimliğiniz güvende, tüm talepleriniz anında ilgili birimlere ulaşıyor."
          />
        </div>

        {/* Alt bilgi */}
        <p className="relative z-10 text-xs text-primary-400">
          © {new Date().getFullYear()} SmartCity. Tüm hakları saklıdır.
        </p>
      </div>

      {/* ── Sağ Panel — Kayıt Formu ── */}
      <div className="flex flex-1 items-center justify-center bg-surface-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobil logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-900">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-900 tracking-tight">
              SmartCity
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
              Kayıt Ol
            </h1>
            <p className="mt-2 text-surface-500">
              Şehrinize katkı sağlamak için hesap oluşturun
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Rol Seçimi */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Hesap Türü
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 ${
                    role === 'citizen'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500'
                      : 'border-surface-200 bg-white text-surface-500 hover:bg-surface-50'
                  }`}
                >
                  <User className={`w-6 h-6 mb-2 ${role === 'citizen' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <span className="text-sm font-medium">Vatandaş</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('official')}
                  className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 ${
                    role === 'official'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500'
                      : 'border-surface-200 bg-white text-surface-500 hover:bg-surface-50'
                  }`}
                >
                  <Building2 className={`w-6 h-6 mb-2 ${role === 'official' ? 'text-primary-600' : 'text-surface-400'}`} />
                  <span className="text-sm font-medium">Belediye Görevlisi</span>
                </button>
              </div>
            </div>

            {/* E-posta */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-surface-700"
              >
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full rounded-[var(--radius-input)] border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-900 placeholder:text-surface-400 outline-none transition-[border-color,box-shadow] duration-[var(--transition-base)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-700"
              >
                Şifre
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full rounded-[var(--radius-input)] border border-surface-300 bg-white py-2.5 pl-10 pr-11 text-sm text-surface-900 placeholder:text-surface-400 outline-none transition-[border-color,box-shadow] duration-[var(--transition-base)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Gönder butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-primary-800 hover:to-primary-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Kayıt Ol
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Yardımcı bileşen ── */
function InfoCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
      <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg bg-white/10">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-primary-300 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
