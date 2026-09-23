"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

interface BookRequest {
  id: string;
  title: string;
  language: string;
  status: "proses" | "done";
  userId: string;
  userName: string;
  createdAt: any;
}

export default function RequestsPage() {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "book_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: BookRequest[] = [];
      snapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as BookRequest);
      });
      setRequests(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !language.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "book_requests"), {
        title: title.trim(),
        language: language.trim(),
        status: "proses",
        userId: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        createdAt: serverTimestamp()
      });
      setTitle("");
      setLanguage("");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Gagal mengirim request buku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (request: BookRequest) => {
    if (!isAdmin) return;
    const newStatus = request.status === "proses" ? "done" : "proses";
    try {
      await updateDoc(doc(db, "book_requests", request.id), {
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengupdate status.");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "-";
    return timestamp.toDate().toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] dark:bg-slate-900 w-full mx-auto px-6 md:px-12 pt-8 md:pt-12 pb-20">
      
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-serif text-surface-950 dark:text-white mb-2">Request Book</h1>
        <p className="text-surface-600 dark:text-surface-400">Ajukan buku yang belum ada di perpustakaan kami.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Form Section */}
        <div className="w-full lg:w-1/3 shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Ajukan Buku Baru</h2>
            
            {user ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Judul Buku</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Contoh: The Great Gatsby"
                    className="w-full px-4 py-2 rounded-xl bg-surface-50 dark:bg-slate-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Bahasa</label>
                  <input 
                    type="text" 
                    id="language" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                    placeholder="Contoh: English / Indonesia"
                    className="w-full px-4 py-2 rounded-xl bg-surface-50 dark:bg-slate-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !language.trim()}
                  className="mt-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Submit Request
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <i className="fa-solid fa-lock text-3xl text-surface-400 mb-4"></i>
                <p className="text-surface-600 dark:text-surface-400 mb-4">Anda harus login untuk merequest buku.</p>
                <Link href="/login" className="px-6 py-2 rounded-full bg-[#2B2B2B] text-white font-medium hover:bg-[#1A1A1A] transition-colors">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-surface-50 dark:bg-slate-900/50 text-surface-500 dark:text-surface-400 text-sm uppercase tracking-wider border-b border-surface-200 dark:border-surface-700">
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Judul Buku</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Bahasa</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Tanggal</th>
                    <th className="px-6 py-4 font-medium text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700 text-surface-800 dark:text-surface-200 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-surface-400">
                        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-brand-500 mb-2"></i>
                        <p>Memuat data...</p>
                      </td>
                    </tr>
                  ) : requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-surface-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{req.title}</td>
                        <td className="px-6 py-4">{req.language}</td>
                        <td className="px-6 py-4 text-surface-500 dark:text-surface-400 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleToggleStatus(req)}
                            disabled={!isAdmin}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                              req.status === 'done' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            <i className={`fa-solid ${req.status === 'done' ? 'fa-check' : 'fa-clock-rotate-left'}`}></i>
                            {req.status}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-surface-400">
                        <i className="fa-regular fa-folder-open text-3xl mb-2 opacity-50"></i>
                        <p>Belum ada request buku.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
