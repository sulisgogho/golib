import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { LayoutGrid, Plus, BarChart2, PieChart } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

// Mematikan caching agar data laporan selalu fresh
export const dynamic = 'force-dynamic'

export default async function LaporanPage() {
  // 1. CEK SESI
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const accountId = (session.user as any).id

  // 2. TENTUKAN BATAS WAKTU (BULAN INI)
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // 3. TARIK DATA TRANSAKSI BULAN INI SAJA
  const transactions = await prisma.transaction.findMany({
    where: {
      account_id: accountId,
      transaction_date: {
        gte: firstDayOfMonth, // gte = greater than or equal (mulai dari tanggal 1)
      },
    },
    include: { category: true },
  })

  // 4. OLAH DATA: Hitung Total & Kelompokkan per Kategori
  let totalBulanIni = 0
  const categoryData: Record<string, { total: number; color: string }> = {}

  transactions.forEach((trx) => {
    const amount = Number(trx.amount)
    totalBulanIni += amount

    const catName = trx.category?.name || 'Lainnya'
    // Gunakan warna kategori jika ada, jika tidak gunakan warna abu-abu default
    const catColor = trx.category?.color_hex || '#94a3b8'

    if (!categoryData[catName]) {
      categoryData[catName] = { total: 0, color: catColor }
    }
    categoryData[catName].total += amount
  })

  // Ubah object menjadi array dan urutkan dari pengeluaran terbesar ke terkecil
  const sortedCategories = Object.entries(categoryData)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="w-full h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      {/* KONTEN UTAMA */}
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {/* HEADER */}
        <header className="p-6 bg-[#0B4D3C] text-white rounded-b-[30px] shadow-md relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-sm font-bold tracking-widest uppercase">Analitik Bulanan</h1>
            <PieChart className="w-5 h-5 text-[#D1F0E0]" />
          </div>

          <p className="text-[10px] font-bold text-[#D1F0E0] tracking-wider uppercase mb-1">TOTAL PENGELUARAN BULAN INI</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-[#86C9AA]">Rp</span>
            <h2 className="text-4xl font-extrabold tracking-tight">{totalBulanIni.toLocaleString('id-ID')}</h2>
          </div>
        </header>

        {/* LIST KATEGORI */}
        <section className="p-6 pt-8">
          <h3 className="font-bold text-gray-800 mb-5">Distribusi Pengeluaran</h3>

          {sortedCategories.length === 0 ? (
            <div className="text-center bg-white p-6 rounded-2xl border border-gray-100">
              <p className="text-sm font-bold text-gray-400">Belum ada data bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {sortedCategories.map((cat, index) => {
                // Hitung persentase untuk lebar bar (maksimal 100%)
                const percentage = Math.round((cat.total / totalBulanIni) * 100)

                return (
                  <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-sm text-gray-800">{cat.name}</p>
                      <p className="font-bold text-sm text-gray-800">Rp{cat.total.toLocaleString('id-ID')}</p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                      {/* Progress Bar Fill */}
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat.color, // Menggunakan warna dari database
                        }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 text-right">{percentage}%</p>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* NAVIGATION BAR BAWAH (Sama persis, tapi ikon Laporan yang aktif) */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-10 py-3 relative z-20">
        {/* Tombol Beranda (Sekarang tidak aktif / abu-abu) */}
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0B4D3C] transition-colors">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">BERANDA</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/tambah" className="w-14 h-14 bg-[#0B4D3C] rounded-full flex items-center justify-center text-white shadow-lg border-[6px] border-white hover:scale-105 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>

        {/* Tombol Laporan (Sekarang aktif / hijau) */}
        <Link href="/laporan" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">LAPORAN</span>
        </Link>
      </nav>
    </div>
  )
}
