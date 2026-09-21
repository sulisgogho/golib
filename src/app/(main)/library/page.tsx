"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDoc, doc, onSnapshot } from "firebase/firestore";
import { Book } from "@/types";

type Tab = "reading" | "saved" | "completed";
type ProgressBook = Book & { lastPage: number; totalPages: number; updatedAt: number; completed?: boolean };

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reading");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progressBooks, setProgressBooks] = useState<ProgressBook[]>([]);
  
  useEffect(() => {
    if (!user) {
      setProgressBooks([]);
      return;
    }

    const q = collection(db, `users/${user.uid}/readingProgress`);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const pBooks: ProgressBook[] = [];
        for (const pDoc of snapshot.docs) {
          const progressData = pDoc.data();
          const bookDoc = await getDoc(doc(db, "books", pDoc.id));
          if (bookDoc.exists()) {
            pBooks.push({
              id: pDoc.id,
              ...bookDoc.data(),
              lastPage: progressData.lastPage,
              totalPages: progressData.totalPages || 100,
              updatedAt: progressData.updatedAt?.toMillis() || 0,
              completed: progressData.completed || false,
            } as ProgressBook);
          }
        }
        pBooks.sort((a, b) => b.updatedAt - a.updatedAt);
        setProgressBooks(pBooks);
      } catch (err) {
        console.error("Error processing progress snapshot", err);
      }
    }, (error) => {
      console.error("Error fetching progress real-time", error);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white p-6 sm:p-10 transition-colors pb-24 md:pb-10 flex flex-col items-center justify-center pt-32">
        <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-500">
          <i className="fa-solid fa-lock text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-3">Akses Terkunci</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
          Silakan masuk terlebih dahulu untuk mengakses perpustakaan pribadimu, menyimpan buku, dan melacak progres membaca.
        </p>
        <Link href="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2">
          <i className="fa-solid fa-arrow-right-to-bracket"></i> Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white p-6 sm:p-10 transition-colors pb-24 md:pb-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Tabs */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold mb-6">My Library</h1>
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("reading")}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === "reading"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Continue Reading
              {activeTab === "reading" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === "saved"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Saved Books
              {activeTab === "saved" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                activeTab === "completed"
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Completed
              {activeTab === "completed" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === "reading" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {progressBooks.filter(b => !b.completed).length === 0 ? (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-500">
                  <i className="fa-solid fa-book-open-reader text-4xl mb-4 opacity-50"></i>
                  <p>Tidak ada buku yang sedang dibaca.</p>
                </div>
              ) : (
                progressBooks.filter(b => !b.completed).map(b => {
                  const percentage = Math.min(100, Math.round((b.lastPage / b.totalPages) * 100));
                  return (
                    <div key={b.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl flex gap-5 hover:shadow-md transition-all group">
                      <div className="w-20 h-28 rounded-lg flex-shrink-0 shadow-sm relative overflow-hidden bg-slate-200" style={{ backgroundColor: `#${b.coverColor || '3b82f6'}` }}>
                        <img
                          src={b.coverUrl || `https://placehold.co/400x600/${b.coverColor || "e2e8f0"}/${b.textColor || "1e293b"}?text=${encodeURIComponent((b.title || "Untitled").split(" ").join("\n"))}`}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1 mb-1">{b.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{b.author}</p>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-slate-600 dark:text-slate-300">Hal {b.lastPage} / {b.totalPages}</span>
                            <span className="text-brand-600 dark:text-brand-400">{percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-brand-500 rounded-full relative" style={{ width: `${percentage}%` }}>
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                          </div>
                          <button onClick={() => router.push(`/read/${b.id}?page=${b.lastPage}`)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 group-hover:underline">
                            Continue reading <i className="fa-solid fa-arrow-right ml-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

            </div>
          )}

          {activeTab === "saved" && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <i className="fa-solid fa-bookmark text-3xl"></i>
              </div>
              <h3 className="text-lg font-bold mb-2">No Saved Books</h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                You haven&apos;t saved any books yet. Explore the discovery page and tap the bookmark icon to save books for later.
              </p>
              <Link href="/" className="bg-brand-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors">
                Explore Books
              </Link>
            </div>
          )}

          {activeTab === "completed" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              
              {progressBooks.filter(b => b.completed).length === 0 ? (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-500">
                  <i className="fa-solid fa-award text-4xl mb-4 opacity-50"></i>
                  <p>Belum ada buku yang diselesaikan.</p>
                </div>
              ) : (
                progressBooks.filter(b => b.completed).map(b => (
                  <div key={b.id} onClick={() => router.push(`/read/${b.id}`)} className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl group flex flex-col hover:shadow-md transition-all">
                    <div className="w-full aspect-[2/3] rounded-lg mb-4 flex items-center justify-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: `#${b.coverColor || '8b5cf6'}` }}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-brand-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                          <i className="fa-solid fa-check"></i> Selesai
                        </div>
                      </div>
                      <span className="font-bold text-center text-sm px-2 relative z-10">{b.title}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 mb-1 group-hover:text-brand-500 transition-colors">{b.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">{b.author}</p>
                    <div className="mt-auto flex items-center gap-1 text-[10px] font-medium text-amber-500">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star-half-stroke"></i>
                    </div>
                  </div>
                ))
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
