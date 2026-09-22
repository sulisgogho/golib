import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { Users, Receipt, Activity, TrendingUp, ShieldCheck, ArrowUpRight, UserPlus, LayoutGrid, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // Proteksi lapis baja: Hanya Super Admin yang boleh masuk
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  // Tarik Data Real-time
  const totalUsers = await prisma.account.count()
  const activeUsers = await prisma.account.count({ where: { status: 'ACTIVE' } })
  const totalTransactions = await prisma.transaction.count()
  const totalAmount = await prisma.transaction.aggregate({
    _sum: { amount: true },
  })

  // Format angka ke jutaan/ribuan agar tidak meluber di layar HP
  const formatCompact = (num: number) => {
    return Intl.NumberFormat('id-ID', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num)
  }

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER ADMIN */}
      <header className="flex justify-between items-center p-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">CENTRAL CONTROL</p>
            <h1 className="text-sm font-bold text-black uppercase">Root Admin</h1>
          </div>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6 pb-24">
        {/* RINGKASAN UTAMA */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">System Pulse</p>
              <h2 className="text-xl font-black text-[#0B4D3C]">Statistik Global</h2>
            </div>
            <span className="text-[10px] font-bold bg-[#D1F0E0] text-[#0B4D3C] px-2 py-1 rounded-md animate-pulse">LIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CARD 1: USERS */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <Users className="w-8 h-8 text-gray-100 absolute right-[-5px] bottom-[-5px]" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Total User</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{totalUsers}</h3>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-[9px] font-bold text-gray-500">{activeUsers} Aktif</span>
              </div>
            </div>

            {/* CARD 2: TRANSAKSI */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <Receipt className="w-8 h-8 text-gray-100 absolute right-[-5px] bottom-[-5px]" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Transaksi</p>
              <h3 className="text-2xl font-black text-gray-800 mt-1">{formatCompact(totalTransactions)}</h3>
              <p className="text-[9px] font-bold text-[#0B4D3C] mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> Stabil
              </p>
            </div>
          </div>
        </section>

        {/* PERPUTARAN UANG (FULL WIDTH CARD) */}
        <section className="bg-[#0B4D3C] p-5 rounded-[28px] shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#D1F0E0] tracking-[0.2em] uppercase mb-1">Total Perputaran Dana</p>
            <h2 className="text-3xl font-black text-white tracking-tight">Rp{Number(totalAmount._sum.amount || 0).toLocaleString('id-ID')}</h2>
            <div className="flex items-center gap-2 mt-4">
              <button className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 px-4 rounded-xl backdrop-blur-md transition-all">Lihat Detail Saldo</button>
            </div>
          </div>
          <Activity className="w-32 h-32 text-white/5 absolute right-[-20px] bottom-[-20px]" />
        </section>

        {/* MENU NAVIGASI CEPAT */}
        <section className="space-y-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Quick Actions</p>

          <Link href="/admin/users" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Kelola Pengguna</p>
                <p className="text-[10px] text-gray-400 italic">Tambah, Edit, atau Suspend Akun</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link href="/admin/transactions" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Log Transaksi</p>
                <p className="text-[10px] text-gray-400 italic">Pantau aliran data masuk</p>
              </div>
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-orange-600 transition-colors" />
          </Link>
        </section>
      </main>

      {/* BOTTOM NAV ADMIN */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-12 py-4 relative z-20">
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] font-bold tracking-widest">DASHBOARD</span>
        </Link>
        <Link href="/admin/users" className="flex flex-col items-center gap-1 text-gray-300">
          <BarChart3 className="w-6 h-6" />
          <span className="text-[9px] font-bold tracking-widest">USERS</span>
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center gap-1 text-gray-300">
          <Settings className="w-6 h-6" />
          <span className="text-[9px] font-bold tracking-widest">CONFIG</span>
        </Link>
      </nav>
    </div>
  )
}
