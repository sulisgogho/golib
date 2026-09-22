import { User, Lock, Landmark } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Bagian Logo & Judul */}
      <div className="flex flex-col items-center mb-8">
        <div className="bg-[#0B4D3C] p-4 rounded-full mb-4 shadow-md">
          <Landmark className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B4D3C] mb-2 tracking-tight">
          CatetDuit
        </h1>
        <p className="text-gray-500 text-sm">
          Kelola kekayaan dengan sentuhan kurator.
        </p>
      </div>

      {/* Bagian Card Form Login */}
      <div className="bg-white p-8 rounded-[24px] shadow-sm w-full max-w-md border border-gray-50">
        
        {/* Input Nama Pengguna */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">
            NAMA PENGGUNA
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all"
              placeholder="username_anda"
            />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-500 tracking-wider">
              KATA SANDI
            </label>
            <Link href="#" className="text-xs font-bold text-[#0B4D3C] hover:underline">
              Lupa?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              className="bg-[#F0F2F1] text-gray-800 text-sm rounded-xl block w-full pl-11 p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0B4D3C] transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Tombol Submit */}
        <button className="w-full text-white bg-[#0B4D3C] hover:bg-[#083A2D] font-semibold rounded-xl text-sm px-5 py-4 text-center transition-colors flex justify-center items-center gap-2">
          Masuk Ke CatetDuit
          <span>→</span>
        </button>

        {/* Footer Card */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-1">Belum memiliki akun?</p>
          <Link href="#" className="text-sm font-bold text-[#0B4D3C] hover:underline">
            Mulai Perjalanan Anda
          </Link>
        </div>
      </div>

    </div>
  );
}