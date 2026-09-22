import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Settings, Wallet, Users, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, Plus, BarChart3, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  // Ambil parameter dari URL
  const params = await searchParams
  const query = params.q || ''
  const currentPage = Number(params.page) || 1
  const pageSize = 5 // Jumlah klien per halaman

  // 1. Ambil Data Klien dengan Filter Pencarian & Pagination
  const [allAccounts, totalUsers, filteredAccounts] = await Promise.all([
    // Ambil semua untuk hitung pendapatan
    prisma.account.findMany({ select: { account_type: true, createdAt: true, status: true } }),
    // Hitung total berdasarkan pencarian
    prisma.account.count({
      where: {
        OR: [{ client_name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }],
      },
    }),
    // Data untuk tabel
    prisma.account.findMany({
      where: {
        OR: [{ client_name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }],
      },
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
  ])

  // 2. Hitung Pendapatan (Berdasarkan SEMUA akun)
  const totalRevenue = allAccounts.reduce((acc, curr) => {
    return acc + (curr.account_type === 'COUPLE' ? 15000 : 10000)
  }, 0)

  const activeUsersCount = allAccounts.filter((a) => a.status === 'ACTIVE').length
  const newUsersToday = allAccounts.filter((a) => {
    return a.createdAt?.toDateString() === new Date().toDateString()
  }).length

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-50">
        <h1 className="text-sm font-black text-[#0B4D3C] tracking-tighter uppercase italic">The Atelier</h1>
        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8 pb-32">
        {/* SUMMARY SECTION */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded tracking-[0.2em] uppercase">Dasbor Global</span>
          <h2 className="text-3xl font-extrabold text-[#0B4D3C] mt-3 tracking-tight">Ringkasan Portofolio</h2>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#0B4D3C] tracking-widest uppercase">Sistem Online</span>
          </div>
        </section>

        {/* REVENUE CARD */}
        <section className="bg-[#0B4D3C] p-7 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#D1F0E0] tracking-[0.2em] uppercase opacity-80 mb-6">Total Pendapatan</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">Rp{totalRevenue.toLocaleString('id-ID')}.00</h3>
            <div className="inline-flex items-center gap-1 mt-6 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
              <TrendingUp className="w-3 h-3 text-[#D1F0E0]" />
              <span className="text-[10px] font-bold text-[#D1F0E0]">
                +12.4% <span className="opacity-60 font-medium ml-1 text-[8px]">vs bulan lalu</span>
              </span>
            </div>
          </div>
        </section>

        {/* ACTIVE USERS CARD */}
        <section className="bg-white p-7 rounded-[32px] shadow-sm border border-gray-50">
          <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-6">Total Klien Aktif</p>
          <h3 className="text-4xl font-black text-[#0B4D3C] tracking-tighter">{activeUsersCount}</h3>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">+ {newUsersToday} Baru Hari Ini</span>
            <div className="flex items-end gap-1 h-8">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <div key={i} className="w-1.5 bg-gray-100 rounded-full" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </section>

        {/* DAFTAR KLIEN SECTION */}
        <section className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-7 pb-4">
            <h3 className="text-lg font-black text-[#0B4D3C]">Daftar Klien</h3>
          </div>

          {/* SEARCH FORM (AKTIF) */}
          <form method="GET" action="/admin/dashboard" className="px-7 flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" name="q" defaultValue={query} placeholder="Cari klien..." className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 text-xs focus:ring-1 focus:ring-[#0B4D3C]" />
            </div>
            <button type="submit" className="bg-gray-50 p-3 rounded-2xl text-[#0B4D3C]">
              <Filter className="w-5 h-5" />
            </button>
          </form>

          {/* TABEL KLIEN */}
          <div className="px-7 grid grid-cols-3 text-[9px] font-black text-gray-300 tracking-[0.2em] uppercase mb-4">
            <span>Nama Pengguna</span>
            <span className="text-center">Mode</span>
            <span className="text-right">Status</span>
          </div>

          <div className="px-3 space-y-1 pb-4">
            {filteredAccounts.map((acc) => (
              <Link
                key={acc.id}
                href={`/admin/users/${acc.id}`} // <--- Ini kuncinya, mengarah ke halaman edit
                className="grid grid-cols-3 items-center p-4 hover:bg-gray-50 rounded-[20px] transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-[#0B4D3C] group-hover:text-white transition-colors">
                    {acc.client_name.substring(0, 2).toUpperCase()}
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
                  <span className={`text-[10px] font-black ${acc.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{acc.status === 'ACTIVE' ? 'Aktif' : 'Off'}</span>
                </div>
              </Link>
            ))}
            {filteredAccounts.length === 0 && <p className="text-center text-[10px] text-gray-400 py-10 font-bold uppercase tracking-widest">Data Tidak Ditemukan</p>}
          </div>

          {/* PAGINATION (AKTIF) */}
          <div className="px-7 py-6 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium italic">
              Hal <span className="font-bold text-gray-800">{currentPage}</span> dari {totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              {currentPage > 1 && (
                <Link href={`/admin/dashboard?q=${query}&page=${currentPage - 1}`} className="p-2 text-gray-400 hover:text-[#0B4D3C]">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
              <div className="w-8 h-8 rounded-full bg-[#0B4D3C] text-white text-[10px] font-black flex items-center justify-center shadow-lg">{currentPage}</div>
              {currentPage < totalPages && (
                <Link href={`/admin/dashboard?q=${query}&page=${currentPage + 1}`} className="p-2 text-gray-400 hover:text-[#0B4D3C]">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM NAV */}
      <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between items-center px-10 py-5 sticky bottom-0 z-30">
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-1.5">
          <div className="bg-[#E6F5EE] p-3 rounded-2xl text-[#0B4D3C] shadow-sm">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-[#0B4D3C] tracking-widest uppercase">Beranda</span>
        </Link>
        <Link href="/admin/users/tambah" className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60 hover:opacity-100 transition-opacity">
          <Plus className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">Tambah</span>
        </Link>
        <Link href="/admin/laporan" className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60 hover:opacity-100 transition-opacity">
          <BarChart3 className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-[0.2em] uppercase">Laporan</span>
        </Link>
      </nav>
    </div>
  )
}
