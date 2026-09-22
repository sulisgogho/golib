'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AtSign, Lock, Landmark, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        username: email, // Di route.ts admin menggunakan email sebagai username
        password: password,
        loginType: 'ADMIN', // Kunci agar masuk ke logika Admin di database
        redirect: false,
      })

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Akses Ditolak: Kredensial Salah' : res.error)
        setIsLoading(false)
      } else {
        router.refresh()
        router.push('/admin/dashboard')
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Efek Cahaya / Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0B4D3C] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Bagian Header Admin */}
      <div className="flex flex-col items-center mb-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#0B4D3C] p-3 rounded-2xl mb-4 shadow-md">
          <Landmark className="text-white w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B4D3C] mb-1 tracking-tight">CatetDuit</h1>
        <p className="text-gray-500 text-xs font-bold tracking-[0.2em]">SUPER ADMIN PORTAL</p>
      </div>

      {/* Card Form Login Admin */}
      <form onSubmit={handleAdminLogin} className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border-t-8 border-[#0B4D3C] z-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang Kembali</h2>
          <p className="text-sm text-gray-500">Silakan masuk untuk mengelola ekosistem finansial.</p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] rounded-xl font-bold flex items-center gap-2 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Input Email */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">EMAIL</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-gray-400 group-focus-within:text-[#0B4D3C] transition-colors" />
            </div>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all border border-transparent focus:bg-white"
              placeholder="admin@catetduit.com"
            />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-500 tracking-wider">PASSWORD</label>
            <Link href="#" className="text-xs font-bold text-[#0B4D3C] hover:underline uppercase tracking-tighter">
              Lupa Password?
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
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all border border-transparent focus:bg-white"
              placeholder="••••••••••••"
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] disabled:bg-gray-400 font-semibold rounded-xl text-sm px-5 py-4 text-center transition-all flex justify-center items-center gap-2 shadow-lg active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Masuk ke Panel Kontrol
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Warning Text */}
        <div className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed max-w-[280px] mx-auto font-medium">
          <p>Akses ini terbatas hanya untuk personil yang berwenang.</p>
          <p>Segala aktivitas dipantau secara ketat untuk keamanan.</p>
        </div>
      </form>

      {/* Footer Copyright */}
      <div className="mt-8 z-10 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">CATETDUIT © 2026</p>
        <div className="flex gap-4">
          <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 tracking-widest uppercase transition-colors">
            KEBIJAKAN PRIVASI
          </Link>
          <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 tracking-widest uppercase transition-colors">
            BANTUAN TEKNIS
          </Link>
        </div>
      </div>
    </div>
  )
}
