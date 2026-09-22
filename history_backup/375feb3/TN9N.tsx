import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, Wallet, Users, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, Plus, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  // 1. Tarik Data Akun (Pastikan penulisan createdAt sudah benar)
  const allAccounts = await prisma.account.findMany({
    select: {
      id: true,
      client_name: true,
      email: true,
      account_type: true,
      status: true,
      createdAt: true, // Pakai CamelCase sesuai database kamu
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 2. HITUNG TOTAL PENDAPATAN (Ini baris yang hilang tadi)
  const totalRevenue = allAccounts.reduce((acc, curr) => {
    if (curr.account_type === 'COUPLE') return acc + 15000
    return acc + 10000
  }, 0)

  // 3. Statistik lainnya
  const totalUsers = allAccounts.length
  const activeUsersCount = allAccounts.filter((a) => a.status === 'ACTIVE').length
  const newUsersToday = allAccounts.filter((a) => {
    const today = new Date().toDateString()
    return a.createdAt ? new Date(a.createdAt).toDateString() === today : false
  }).length

  const recentAccounts = allAccounts.slice(0, 5)

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER ATELIER */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-50">
        <h1 className="text-sm font-black text-[#0B4D3C] tracking-tighter uppercase italic">The Atelier</h1>
        <div className="bg-gray-100 p-2 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
          <Settings className="w-4 h-4" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8 pb-32">
        {/* TITLE SECTION */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded tracking-[0.2em] uppercase">Dasbor Global</span>
          <h2 className="text-3xl font-extrabold text-[#0B4D3C] mt-3 tracking-tight">Ringkasan Portofolio</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">Analisis performa real-time dan metrik akuisisi klien di seluruh ekosistem The Atelier.</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#0B4D3C] tracking-widest uppercase">Sistem Aktif</span>
          </div>
        </section>

        {/* CARD 1: TOTAL PENDAPATAN (GREEN CARD) */}
        <section className="bg-[#0B4D3C] p-7 rounded-[32px] shadow-2xl relative overflow-hidden group transition-transform active:scale-[0.98]">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-bold text-[#D1F0E0] tracking-[0.2em] uppercase opacity-80">Total Pendapatan</p>
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tighter">Rp{totalRevenue.toLocaleString('id-ID')}.00</h3>
            <div className="inline-flex items-center gap-1 mt-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              <TrendingUp className="w-3 h-3 text-[#D1F0E0]" />
              <span className="text-[10px] font-bold text-[#D1F0E0]">
                +12.4% <span className="opacity-60 font-medium ml-1 text-[8px]">dari kuartal terakhir</span>
              </span>
            </div>
          </div>
          {/* Dekorasi Background */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        </section>

        {/* CARD 2: KLIEN AKTIF (WHITE CARD) */}
        <section className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-50 relative">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase font-black">Total Klien Aktif</p>
            <div className="bg-gray-50 p-2 rounded-xl text-gray-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-4xl font-black text-[#0B4D3C] tracking-tighter">{activeUsersCount.toLocaleString('id-ID')}</h3>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{newUsersToday > 0 ? `+ ${newUsersToday} Baru Hari Ini` : 'Belum Ada User Baru'}</span>
            <div className="flex items-end gap-1 h-8">
              {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                <div key={i} className="w-1.5 bg-gray-100 rounded-full" style={{ height: `${h * 100}%` }}></div>
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
              <input type="text" placeholder="Cari klien..." className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 text-xs focus:ring-1 focus:ring-[#0B4D3C]/20 transition-all" />
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 hover:text-[#0B4D3C] transition-colors cursor-pointer">
              <Filter className="w-5 h-5" />
            </div>
          </div>

          {/* TABLE HEAD */}
          <div className="px-7 grid grid-cols-3 text-[9px] font-black text-gray-300 tracking-[0.2em] uppercase mb-4">
            <span>Nama Pengguna</span>
            <span className="text-center">Mode</span>
            <span className="text-right">Status</span>
          </div>

          {/* TABLE ROWS */}
          <div className="px-3 space-y-1 pb-4">
            {recentAccounts.map((acc) => (
              <div key={acc.id} className="grid grid-cols-3 items-center p-4 hover:bg-gray-50 rounded-[20px] transition-all cursor-pointer group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase border border-gray-50 group-hover:bg-[#0B4D3C] group-hover:text-white transition-colors">
                    {acc.client_name.substring(0, 2)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-gray-800 truncate">{acc.client_name.replace(/\s+/g, '_')}</p>
                    <p className="text-[9px] text-gray-400 truncate">{acc.email}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className={`text-[8px] font-black px-3 py-1 rounded-md tracking-widest uppercase ${acc.account_type === 'COUPLE' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{acc.account_type}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${acc.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-[10px] font-black ${acc.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{acc.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="px-7 py-6 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">
              Menampilkan <span className="font-bold text-gray-800">5 dari {totalUsers}</span> klien
            </span>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#0B4D3C] text-white text-[10px] font-black shadow-lg shadow-[#0B4D3C]/20 active:scale-90 transition-transform">1</button>
              <button className="w-8 h-8 rounded-full text-gray-400 text-[10px] font-bold hover:bg-gray-100 transition-colors">2</button>
              <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAV ADMIN */}
      <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between items-center px-10 py-5 sticky bottom-0 z-30">
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-[#E6F5EE] p-3 rounded-2xl text-[#0B4D3C] shadow-sm">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-[#0B4D3C] tracking-[0.2em] uppercase">Beranda</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60 hover:opacity-100 transition-opacity">
          <Plus className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">Tambah</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60 hover:opacity-100 transition-opacity">
          <BarChart3 className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">Laporan</span>
        </div>
      </nav>
    </div>
  )
}
