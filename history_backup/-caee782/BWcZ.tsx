import { AtSign, Lock, Landmark, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Efek Cahaya / Glow (Opsional, menyesuaikan nuansa desain) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0B4D3C] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Bagian Header Admin */}
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="bg-[#0B4D3C] p-3 rounded-2xl mb-4 shadow-md">
          <Landmark className="text-white w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B4D3C] mb-1 tracking-tight">CatetDuit</h1>
        <p className="text-gray-500 text-xs font-bold tracking-[0.2em]">SUPER ADMIN PORTAL</p>
      </div>

      {/* Card Form Login Admin */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border-t-8 border-[#0B4D3C] z-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang Kembali</h2>
          <p className="text-sm text-gray-500">Silakan masuk untuk mengelola ekosistem finansial.</p>
        </div>

        {/* Input Email */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">EMAIL</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-gray-400" />
            </div>
            <input type="email" className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all" placeholder="admin@catetduit.com" />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-500 tracking-wider">PASSWORD</label>
            <Link href="#" className="text-xs font-bold text-[#0B4D3C] hover:underline">
              Lupa Password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input type="password" className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all" placeholder="••••••••••••" />
          </div>
        </div>

        {/* Tombol Submit */}
        <button className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] font-semibold rounded-xl text-sm px-5 py-4 text-center transition-colors flex justify-center items-center gap-2">
          Masuk ke Panel Kontrol
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Warning Text */}
        <div className="mt-8 text-center text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
          <p>Akses ini terbatas hanya untuk personil yang berwenang.</p>
          <p>Segala aktivitas dipantau secara ketat untuk keamanan.</p>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="mt-8 z-10 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">CATETDUIT © 2026</p>
        <div className="flex gap-4">
          <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 tracking-widest uppercase">
            KEBIJAKAN PRIVASI
          </Link>
          <Link href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 tracking-widest uppercase">
            BANTUAN TEKNIS
          </Link>
        </div>
      </div>
    </div>
  )
}
