import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, Wallet, Users, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, Plus, BarChart3, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // ... (Bagian session & proteksi)

  // 1. Tarik semua data akun untuk perhitungan pendapatan
  const allAccounts = await prisma.account.findMany({
    select: { account_type: true }
  })

  // 2. Hitung Total Pendapatan berdasarkan tipe akun
  const totalRevenue = allAccounts.reduce((acc, curr) => {
    if (curr.account_type === 'COUPLE') return acc + 15000
    return acc + 10000 // Default untuk SINGLE
  }, 0)

  const totalUsers = allAccounts.length
  
  // 3. Ambil data untuk tabel klien (seperti sebelumnya)
  const accounts = await prisma.account.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  })

  return (
    // ... (Bagian header tetap sama)

    {/* KARTU PENDAPATAN (GREEN CARD) */}
    <section className="bg-[#0B4D3C] p-7 rounded-[32px] shadow-2xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-bold text-[#D1F0E0] tracking-[0.2em] uppercase opacity-80">Estimasi Pendapatan</p>
          <div className="bg-white/10 p-2 rounded-xl">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
        <h3 className="text-3xl font-black text-white tracking-tighter">
          Rp{totalRevenue.toLocaleString('id-ID')}
        </h3>
        <div className="inline-flex items-center gap-1 mt-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
          <span className="text-[9px] font-bold text-[#D1F0E0] tracking-widest uppercase">
            {allAccounts.filter(a => a.account_type === 'COUPLE').length} Couple • {allAccounts.filter(a => a.account_type === 'SINGLE').length} Single
          </span>
        </div>
      </div>
    </section>

        {/* CARD 2: KLIEN AKTIF (WHITE CARD) */}
        <section className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-50 relative">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Total Klien Aktif</p>
            <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-4xl font-black text-[#0B4D3C] tracking-tighter">{totalUsers.toLocaleString('id-ID')}</h3>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">• 24 Baru Hari Ini</span>
            <div className="flex items-end gap-0.5 h-8">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <div key={i} className="w-1.5 bg-gray-100 rounded-t-sm" style={{ height: `${h * 100}%` }}></div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: DAFTAR KLIEN */}
        <section className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-7 pb-4">
            <h3 className="text-lg font-black text-[#0B4D3C]">Daftar Klien</h3>
            <p className="text-[11px] text-gray-400 mt-1">Kelola akses dan status akun pengguna</p>
          </div>

          {/* SEARCH & FILTER */}
          <div className="px-7 flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Cari klien..." className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 text-xs focus:ring-1 focus:ring-gray-200" />
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
              <Filter className="w-5 h-5" />
            </div>
          </div>

          {/* TABLE HEAD */}
          <div className="px-7 grid grid-cols-3 text-[9px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-4">
            <span>Nama Pengguna</span>
            <span className="text-center">Mode</span>
            <span className="text-right">Status</span>
          </div>

          {/* TABLE ROWS */}
          <div className="px-3 space-y-1 pb-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="grid grid-cols-3 items-center p-4 hover:bg-gray-50 rounded-[20px] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">{acc.client_name.substring(0, 2)}</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-800 truncate">{acc.client_name.replace(' ', '_')}</p>
                    <p className="text-[9px] text-gray-400 truncate">{acc.email}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className={`text-[8px] font-bold px-3 py-1 rounded-md tracking-widest uppercase ${acc.account_type === 'COUPLE' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{acc.account_type}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-[10px] font-bold ${acc.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{acc.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="px-7 py-6 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">
              Menampilkan <span className="font-bold text-gray-800">3 dari {totalUsers}</span> klien
            </span>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#0B4D3C] text-white text-[10px] font-bold shadow-lg shadow-[#0B4D3C]/20">1</button>
              <button className="w-8 h-8 rounded-full text-gray-400 text-[10px] font-bold">2</button>
              <button className="p-2 text-gray-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAV */}
      <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-50 flex justify-between items-center px-10 py-5 sticky bottom-0 z-30">
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-[#E6F5EE] p-3 rounded-2xl text-[#0B4D3C]">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-[#0B4D3C] tracking-widest uppercase">Beranda</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60">
          <Plus className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-widest uppercase">Tambah</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60">
          <BarChart3 className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-widest uppercase">Laporan</span>
        </div>
      </nav>
    </div>
  )
}

function TrendingUpIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
