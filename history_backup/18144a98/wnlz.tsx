'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Lock, Landmark, Loader2, AlertCircle } from 'lucide-react' // Tambah AlertCircle
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Panggil mesin NextAuth
      const res = await signIn('credentials', {
        username: username.trim(), // Bersihkan spasi yang tidak sengaja terketik
        password,
        loginType: 'CLIENT',
        redirect: false,
      })

      if (res?.error) {
        // Pesan error yang lebih bersahabat
        setError(res.error === 'CredentialsSignin' ? 'Username atau password salah.' : res.error)
        setIsLoading(false)
      } else {
        // BERHASIL!
        // Penting: router.push seringkali terlalu cepat sebelum session terupdate.
        // Kita gunakan router.refresh() agar data session terbaru (termasuk pasangan) ditarik dulu.
        router.refresh()
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4 font-sans">
      <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#0B4D3C] p-4 rounded-full mb-4 shadow-lg">
          <Landmark className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B4D3C] mb-2 tracking-tight">CatetDuit</h1>
        <p className="text-gray-500 text-sm">Kelola kekayaan dengan sentuhan kurator.</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-gray-100">
        {/* Notifikasi Error yang lebih cantik */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl font-semibold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] mb-3 uppercase">Nama Pengguna</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#0B4D3C] transition-colors" />
            </div>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-2xl block w-full pl-11 p-4 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 focus:bg-white border border-transparent focus:border-[#0B4D3C] transition-all"
              placeholder="username_anda"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Kata Sandi</label>
            <Link href="#" className="text-[10px] font-bold text-[#0B4D3C] hover:text-[#083A2D] uppercase tracking-wider">
              Lupa Sandi?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#0B4D3C] transition-colors" />
            </div>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-2xl block w-full pl-11 p-4 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 focus:bg-white border border-transparent focus:border-[#0B4D3C] transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] active:scale-[0.98] disabled:bg-[#0B4D3C]/50 disabled:active:scale-100 font-bold rounded-2xl text-sm px-5 py-4 transition-all flex justify-center items-center gap-2 shadow-[0_8px_20px_rgba(11,77,60,0.2)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            'Masuk Ke CatetDuit →'
          )}
        </button>

        <div className="mt-8 text-center border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 mb-2">Belum memiliki akses eksklusif?</p>
          <Link href="#" className="text-sm font-bold text-[#0B4D3C] hover:text-[#083A2D] tracking-tight">
            Hubungi Admin / Mulai Perjalanan →
          </Link>
        </div>
      </form>
    </div>
  )
}
