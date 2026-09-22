import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { BarChart3, TrendingUp, Users, ArrowUpRight, Download, ChevronLeft, LayoutGrid, Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AdminLaporanPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') redirect('/login')

  // Tarik Data Statistik
  const allAccounts = await prisma.account.findMany({ select: { account_type: true, status: true } })

  const totalSingle = allAccounts.filter((a) => a.account_type === 'SINGLE').length
  const totalCouple = allAccounts.filter((a) => a.account_type === 'COUPLE').length
  const revSingle = totalSingle * 10000
  const revCouple = totalCouple * 15000
  const grandTotal = revSingle + revCouple

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="px-6 py-5 bg-white border-b border-gray-50 sticky top-0 z-10 flex justify-between items-center">
        <Link href="/admin/dashboard" className="p-2 bg-gray-50 rounded-xl text-gray-400">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-black text-[#0B4D3C] uppercase tracking-[0.2em]">Analisis Bisnis</h1>
        <div className="w-9"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-32 scrollbar-hide">
        {/* REVENUE SUMMARY */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimasi Bruto</p>
              <h2 className="text-3xl font-black text-[#0B4D3C] tracking-tighter mt-1">Rp{grandTotal.toLocaleString('id-ID')}</h2>
            </div>
            <div className="bg-[#EFFFF6] p-2 rounded-xl text-[#0B4D3C]">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          {/* Breakdown Pendapatan */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-gray-600">Akun Single ({totalSingle})</span>
              </div>
              <span className="text-xs font-black text-gray-800">Rp{revSingle.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-bold text-gray-600">Akun Couple ({totalCouple})</span>
              </div>
              <span className="text-xs font-black text-gray-800">Rp{revCouple.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </section>

        {/* GROWTH CHART (CSS BARS) */}
        <section className="bg-[#0B4D3C] p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Pertumbuhan User</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {[30, 45, 35, 60, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-white/20 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}>
                    <div className="w-full bg-white rounded-t-lg" style={{ height: `${h * 0.4}%` }}></div>
                  </div>
                  <span className="text-[8px] font-bold opacity-60">BLN {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <TrendingUp className="absolute top-4 right-4 w-12 h-12 text-white/10" />
        </section>

        {/* METRIK TAMBAHAN */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm">
            <Users className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-[9px] font-bold text-gray-400 uppercase">Retention Rate</p>
            <h4 className="text-xl font-black text-[#0B4D3C]">98.2%</h4>
          </div>
          <div className="bg-white p-5 rounded-[28px] border border-gray-50 shadow-sm">
            <ArrowUpRight className="w-5 h-5 text-gray-300 mb-3" />
            <p className="text-[9px] font-bold text-gray-400 uppercase">Avg Revenue</p>
            <h4 className="text-xl font-black text-[#0B4D3C]">Rp12.5k</h4>
          </div>
        </div>

        {/* EXPORT BUTTON */}
        <button className="w-full bg-white border-2 border-dashed border-gray-200 py-5 rounded-[28px] flex flex-col items-center justify-center gap-1 group hover:border-[#0B4D3C] transition-all active:scale-95">
          <Download className="w-5 h-5 text-gray-300 group-hover:text-[#0B4D3C]" />
          <span className="text-[10px] font-black text-gray-400 group-hover:text-[#0B4D3C] uppercase tracking-widest">Ekspor Laporan PDF</span>
        </button>
      </main>

      {/* NAVIGATION */}
      <nav className="bg-white border-t border-gray-50 flex justify-between items-center px-10 py-5 sticky bottom-0 z-30">
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-widest uppercase">Beranda</span>
        </Link>
        <Link href="/admin/users/tambah" className="flex flex-col items-center gap-1.5 text-gray-300 opacity-60">
          <Plus className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-widest uppercase">Tambah</span>
        </Link>
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-[#E6F5EE] p-3 rounded-2xl text-[#0B4D3C]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-black text-[#0B4D3C] tracking-widest uppercase">Laporan</span>
        </div>
      </nav>
    </div>
  )
}
