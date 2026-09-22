'use client' // Ubah jadi Client Component karena butuh State

import { useState } from 'react'
import { ArrowLeft, UserPlus, Mail, Lock, User, Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tambahClient } from '@/app/actions/admin'

export default function TambahKlienPage() {
  const [accountType, setAccountType] = useState('SINGLE')
  const router = useRouter()

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 bg-white border-b border-gray-50">
        <Link href="/admin/dashboard" className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black text-[#0B4D3C] uppercase tracking-widest">Registrasi Klien</h1>
        <div className="w-9"></div>
      </header>

      <form
        action={async (formData) => {
          await tambahClient(formData)
          router.push('/admin/dashboard')
        }}
        className="flex-1 overflow-y-auto p-6 space-y-5 pb-24"
      >
        {/* ... (Input Nama, Username, Email, Password tetap sama seperti sebelumnya) ... */}

        {/* INPUT NAMA LENGKAP (Sudah ada di kode sebelumnya) */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
          <input name="client_name" required className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold outline-none shadow-sm" />
        </div>

        {/* PILIH PAKET */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paket Langganan</label>
          <select
            name="account_type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm"
          >
            <option value="SINGLE">SINGLE (Rp10.000)</option>
            <option value="COUPLE">COUPLE (Rp15.000)</option>
          </select>
        </div>

        {/* INPUT PARTNER (MUNCUL HANYA JIKA COUPLE) */}
        {accountType === 'COUPLE' && (
          <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Informasi Pasangan</span>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Nama Partner 1 (Diri Sendiri/User)</label>
              <input name="partner_1" required placeholder="Contoh: El" className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 text-xs text-gray-800 font-bold outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Nama Partner 2 (Pasangan)</label>
              <input name="partner_2" required placeholder="Contoh: Tyo" className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 text-xs text-gray-800 font-bold outline-none" />
            </div>
          </div>
        )}

        {/* ... (Lanjutkan Input Email, Password, dan Tombol Daftarkan) ... */}

        <div className="pt-4">
          <button type="submit" className="w-full bg-[#0B4D3C] text-white py-5 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <UserPlus className="w-5 h-5" /> Daftarkan Klien
          </button>
        </div>
      </form>
    </div>
  )
}
