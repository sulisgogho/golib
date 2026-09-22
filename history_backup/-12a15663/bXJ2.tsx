import { PrismaClient } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Save, User, Mail, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { updateClient } from '@/app/actions/admin'

const prisma = new PrismaClient()

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const account = await prisma.account.findUnique({ where: { id } })

  if (!account) notFound()

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 bg-white border-b border-gray-50">
        <Link href="/admin/dashboard" className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black text-[#0B4D3C] uppercase tracking-widest">Edit Profil Klien</h1>
        <div className="w-9"></div>
      </header>

      <form
        action={async (formData) => {
          'use server'
          await updateClient(formData)
          redirect('/admin/dashboard')
        }}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        <input type="hidden" name="id" value={account.id} />

        {/* INPUT NAMA */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Klien</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input name="client_name" defaultValue={account.client_name} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm" />
          </div>
        </div>

        {/* INPUT EMAIL */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input name="email" defaultValue={account.email} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#0B4D3C] outline-none shadow-sm" />
          </div>
        </div>

        {/* SELECT STATUS */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Akun</label>
          <div className="relative">
            <Shield className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <select name="status" defaultValue={account.status} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#0B4D3C] outline-none appearance-none shadow-sm">
              <option value="ACTIVE">Aktif (Akses Penuh)</option>
              <option value="SUSPENDED">Ditangguhkan (Blokir)</option>
            </select>
          </div>
        </div>

        {/* SELECT MODE/PAKET */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paket Langganan</label>
          <div className="relative">
            <Zap className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <select name="account_type" defaultValue={account.account_type} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#0B4D3C] outline-none appearance-none shadow-sm">
              <option value="SINGLE">Single (Rp10.000)</option>
              <option value="COUPLE">Couple (Rp15.000)</option>
            </select>
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="w-full bg-[#0B4D3C] text-white py-5 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Save className="w-5 h-5" /> Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
