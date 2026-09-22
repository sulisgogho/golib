'use client'

import { useState } from 'react'
import { ArrowLeft, UserPlus, Mail, Lock, User, Shield, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { tambahClient } from '@/app/actions/admin'

export default function TambahKlienPage() {
  const [accountType, setAccountType] = useState('SINGLE')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await tambahClient(formData)
      router.push('/admin/dashboard')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Gagal mendaftarkan klien. Pastikan email/username unik.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex items-center justify-between p-6 bg-white border-b border-gray-50 sticky top-0 z-10">
        <Link href="/admin/dashboard" className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#0B4D3C] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black text-[#0B4D3C] uppercase tracking-widest">Registrasi Klien</h1>
        <div className="w-9"></div>
      </header>

      <form action={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 pb-32 scrollbar-hide">
        {/* SECTION: DATA PRIBADI */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#0B4D3C]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informasi Dasar</span>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <input
              name="client_name"
              required
              placeholder="Eleanor Vane"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Username Login</label>
            <input name="username" required placeholder="eleanor_vane" className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 shadow-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Alamat Email</label>
            <input
              type="email"
              name="email"
              required
              placeholder="el@atelier.com"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 shadow-sm"
            />
          </div>
        </div>

        {/* SECTION: KEAMANAN */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Password Default</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 shadow-sm"
            />
          </div>
        </div>

        {/* SECTION: LAYANAN */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-[#0B4D3C]" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paket Layanan</span>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Pilih Tipe Akun</label>
            <select
              name="account_type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold outline-none focus:ring-2 focus:ring-[#0B4D3C]/20 shadow-sm appearance-none"
            >
              <option value="SINGLE">SINGLE ACCOUNT (Rp10.000)</option>
              <option value="COUPLE">COUPLE ACCOUNT (Rp15.000)</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC SECTION: PARTNER (Hanya muncul jika COUPLE) */}
        {accountType === 'COUPLE' && (
          <div className="space-y-4 p-5 bg-rose-50/50 rounded-[24px] border border-rose-100 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Detail Pasangan</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Partner 1 (User)</label>
                <input name="partner_1" required={accountType === 'COUPLE'} placeholder="Nama P1" className="w-full bg-white border border-gray-100 rounded-xl py-3 px-3 text-xs text-gray-800 font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-400 uppercase">Partner 2 (Pasangan)</label>
                <input name="partner_2" required={accountType === 'COUPLE'} placeholder="Nama P2" className="w-full bg-white border border-gray-100 rounded-xl py-3 px-3 text-xs text-gray-800 font-bold outline-none" />
              </div>
            </div>
            <p className="text-[8px] text-rose-400 italic font-medium leading-tight">Nama ini akan muncul pada menu pemilihan "Dibayar Oleh" di aplikasi klien.</p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0B4D3C] text-white py-5 rounded-[24px] font-black text-sm shadow-xl shadow-[#0B4D3C]/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-gray-300 disabled:shadow-none"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Daftarkan Klien
              </>
            )}
          </button>
          <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-4">Pastikan semua data sudah benar sebelum pendaftaran</p>
        </div>
      </form>
    </div>
  )
}
