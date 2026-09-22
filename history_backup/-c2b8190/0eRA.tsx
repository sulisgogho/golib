"use client";

import { Bell, Settings, Filter, Utensils, ShoppingBag, LayoutGrid, Plus, BarChart2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    // 1. PEMBUNGKUS UTAMA: Setinggi layar (h-screen) dan menggunakan Flex Column
    <div className="h-screen bg-[#F7F9F8] font-sans max-w-md mx-auto relative shadow-xl flex flex-col overflow-hidden">
      
      {/* 2. AREA KONTEN: Memenuhi sisa ruang (flex-1) dan bisa di-scroll (overflow-y-auto) */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 bg-white sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0B4D3C] text-white flex items-center justify-center font-bold shadow-sm">
              T
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">HALO, TYO</p>
              <h1 className="text-sm font-bold text-[#0B4D3C]">Tyo & El's Ledger</h1>
            </div>
          </div>
          <div className="flex gap-4 text-[#0B4D3C]">
            <Bell className="w-5 h-5 cursor-pointer" />
            <Settings className="w-5 h-5 cursor-pointer" />
          </div>
        </header>

        {/* TOTAL SALDO SECTION */}
        <section className="px-6 py-4">
          <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">
            TOTAL PENGELUARAN BULAN INI
          </p>
          <div className="flex items-baseline gap-1 mb-2">
            <h2 className="text-4xl font-extrabold text-[#0B4D3C] tracking-tight">Rp4.285</h2>
            <span className="text-lg font-bold text-gray-400">.50k</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#D1F0E0] text-[#0B4D3C] px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
              <span className="text-[10px]">↘</span> Menurun 12%
            </div>
            <span className="text-xs text-gray-400 font-medium">vs bulan lalu</span>
          </div>
        </section>

        {/* FILTER BULAN */}
        <section className="px-6 py-4 flex gap-6 overflow-x-auto scrollbar-hide text-sm font-bold text-gray-400 border-b border-gray-100">
          <button className="whitespace-nowrap hover:text-[#0B4D3C]">Januari</button>
          <button className="whitespace-nowrap hover:text-[#0B4D3C]">Februari</button>
          <button className="whitespace-nowrap bg-[#0B4D3C] text-white px-4 py-1.5 rounded-full shadow-sm">Maret</button>
          <button className="whitespace-nowrap hover:text-[#0B4D3C]">April</button>
          <button className="whitespace-nowrap hover:text-[#0B4D3C]">Mei</button>
        </section>

        {/* RIWAYAT TRANSAKSI */}
        <section className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Riwayat Transaksi</h3>
            <button className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <span className="text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded-full">Semua</span>
            <span className="text-xs font-bold bg-white text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">Tyo</span>
            <span className="text-xs font-bold bg-white text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">El</span>
          </div>

          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">HARI INI, 14 MARET</p>
            
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F5EE] flex items-center justify-center text-[#0B4D3C]">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Indigo Terrace Dining</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Dibayar oleh <span className="font-bold text-gray-600">Tyo</span> • 19:15</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-800">Rp124k</p>
                <p className="text-[9px] font-bold text-[#0B4D3C] tracking-wider uppercase mt-1">KULINER</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] flex items-center justify-center text-[#E67E22]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Maison Margiela Atelier</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Dibayar oleh <span className="font-bold text-gray-600">El</span> • 15:45</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-gray-800">Rp890k</p>
                <p className="text-[9px] font-bold text-[#E67E22] tracking-wider uppercase mt-1">GAYA HIDUP</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 3. NAVIGATION BAR: Duduk manis di bawah, mengikuti lebar persis parent-nya */}
      <nav className="bg-white border-t border-gray-100 flex justify-between items-center px-10 py-3 relative z-20">
        
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#0B4D3C]">
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">BERANDA</span>
        </Link>
        
        {/* Tombol Plus dengan trik posisi agar menonjol tapi tidak merusak lebar bar */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <Link href="/tambah" className="w-14 h-14 bg-[#0B4D3C] rounded-full flex items-center justify-center text-white shadow-lg border-[6px] border-white hover:scale-105 transition-transform">
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </Link>
        </div>

        <Link href="/laporan" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#0B4D3C] transition-colors">
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-extrabold tracking-widest uppercase mt-0.5">LAPORAN</span>
        </Link>

      </nav>

    </div>
  );
}