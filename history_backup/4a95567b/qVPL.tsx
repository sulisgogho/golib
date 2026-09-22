import { ArrowLeft, UserPlus, Shield, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { tambahClient } from '@/app/actions/admin'

export default function TambahKlienPage() {
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
          'use server'
          await tambahClient(formData)
          redirect('/admin/dashboard')
        }}
        className="flex-1 overflow-y-auto p-6 space-y-5 pb-24"
      >
        {/* INPUT NAMA LENGKAP */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="client_name"
              required
              placeholder="Contoh: Eleanor Vane"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm"
            />
          </div>
        </div>

        {/* INPUT USERNAME */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username (Untuk Login)</label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="username"
              required
              placeholder="eleanor_vane"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm"
            />
          </div>
        </div>

        {/* INPUT EMAIL */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              required
              placeholder="email@atelier.com"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm"
            />
          </div>
        </div>

        {/* INPUT PASSWORD */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Awal</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm"
            />
          </div>
        </div>

        {/* PILIH PAKET */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paket Langganan</label>
          <select name="account_type" className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-sm text-gray-800 font-bold focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm appearance-none">
            <option value="SINGLE">SINGLE (Rp10.000)</option>
            <option value="COUPLE">COUPLE (Rp15.000)</option>
          </select>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-[#0B4D3C] text-white py-5 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <UserPlus className="w-5 h-5" /> Daftarkan Klien
          </button>
        </div>
      </form>
    </div>
  )
}
