'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, User, Mail, Shield, Zap, Heart, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { updateClient, deleteClient } from '@/app/actions/admin'

// Kita butuh fetch data client karena ini Client Component
export default function EditClientPage() {
  const params = useParams()
  const router = useRouter()
  const [account, setAccount] = useState<any>(null)
  const [accountType, setAccountType] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load data awal
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/admin/users/${params.id}`)
      const data = await res.json()
      setAccount(data)
      setAccountType(data.account_type)
    }
    fetchData()
  }, [params.id])

  const handleDelete = async () => {
    if (confirm(`Hapus akun ${account.client_name}? Semua data transaksi mereka akan hilang permanen.`)) {
      setIsLoading(true)
      await deleteClient(account.id)
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  if (!account) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Memuat Data...</div>

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-6 bg-white border-b border-gray-50 sticky top-0 z-10">
        <Link href="/admin/dashboard" className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black text-[#0B4D3C] uppercase tracking-widest">Manajemen Klien</h1>
        <button onClick={handleDelete} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      <form
        action={async (formData) => {
          setIsLoading(true)
          await updateClient(formData)
          router.push('/admin/dashboard')
          router.refresh()
        }}
        className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 scrollbar-hide"
      >
        <input type="hidden" name="id" value={account.id} />

        {/* NAMA & EMAIL */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nama Klien</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input name="client_name" defaultValue={account.client_name} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold outline-none shadow-sm" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input name="email" defaultValue={account.email} className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm text-gray-800 font-bold outline-none shadow-sm" />
            </div>
          </div>
        </div>

        {/* STATUS & TIPE */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Status</label>
            <select name="status" defaultValue={account.status} className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-xs text-gray-800 font-bold outline-none shadow-sm appearance-none">
              <option value="ACTIVE">AKTIF</option>
              <option value="SUSPENDED">BLOKIR</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Paket</label>
            <select
              name="account_type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-4 text-xs text-gray-800 font-bold outline-none shadow-sm appearance-none"
            >
              <option value="SINGLE">SINGLE</option>
              <option value="COUPLE">COUPLE</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC PARTNER SECTION */}
        {accountType === 'COUPLE' && (
          <div className="space-y-4 p-5 bg-[#EFFFF6] rounded-[24px] border border-[#0B4D3C]/5 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#0B4D3C] fill-[#0B4D3C]" />
              <span className="text-[10px] font-black text-[#0B4D3C] uppercase tracking-widest">Detail Pasangan</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="partner_1" defaultValue={account.partner_1_name} placeholder="Nama P1" className="w-full bg-white rounded-xl py-3 px-3 text-xs text-gray-800 font-bold outline-none" />
              <input name="partner_2" defaultValue={account.partner_2_name} placeholder="Nama P2" className="w-full bg-white rounded-xl py-3 px-3 text-xs text-gray-800 font-bold outline-none" />
            </div>
          </div>
        )}

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="w-full bg-[#0B4D3C] text-white py-5 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" /> Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
