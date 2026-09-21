"use client";

import { useState, useMemo, useEffect } from "react";
import BookCard from "@/components/BookCard";
import CategoryPill from "@/components/CategoryPill";
import OverviewModal from "@/components/OverviewModal";
import { useRouter } from "next/navigation";
import { Book } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, getDoc, doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { booksData } from "@/lib/data";

type ProgressBook = Book & { lastPage: number; totalPages: number; updatedAt: number };

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [dbBooks, setDbBooks] = useState<Book[]>(booksData);
  const [loading, setLoading] = useState(true);
  const [progressBooks, setProgressBooks] = useState<ProgressBook[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedBooks: Book[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBooks.push({ id: doc.id, ...doc.data() } as Book);
        });
        if (fetchedBooks.length > 0) {
          setDbBooks(fetchedBooks);
        } else {
          setDbBooks(booksData); // fallback to mock data if empty
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setDbBooks(booksData);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

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
              totalPages: progressData.totalPages || 100, // fallback
              updatedAt: progressData.updatedAt?.toMillis() || 0
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

  const categories = useMemo(() => {
    return ["All Books", ...Array.from(new Set(dbBooks.map((b) => b.category)))];
  }, [dbBooks]);

  const filteredBooks = useMemo(() => {
    return dbBooks.filter((book) => {
      const matchCat =
        activeCategory === "All Books" || book.category === activeCategory;
      const title = book.title || "";
      const author = book.author || "";
      const matchSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery, dbBooks]);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("color-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("color-theme", "dark");
    }
  };

  return (
    <>
      {/* Sand Colored Background Shape */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-[#EBE6DA] dark:bg-slate-800/80 rounded-bl-[3rem] md:rounded-bl-[5rem] pointer-events-none z-0 transition-colors duration-300"></div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-24 md:pb-8">
        {/* Simplified Navbar / Header */}
        <div className="flex items-center justify-between gap-4 sm:gap-6 mb-10 w-full">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md group">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 rounded-full py-3 pl-6 pr-12 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#24403B]/20 dark:focus:ring-brand-500/20 focus:border-[#24403B] dark:focus:border-brand-500 transition-all shadow-sm"
            />
            <button className="absolute inset-y-1 right-1 flex items-center justify-center w-10 bg-[#24403B] hover:bg-[#1a2f2b] dark:bg-brand-500 dark:hover:bg-brand-600 text-white rounded-full transition-colors shadow-sm">
              <i className="fa-solid fa-search text-xs"></i>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Attractive Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 overflow-hidden group"
              aria-label="Toggle Theme"
            >
              <div className="absolute transition-transform duration-500 ease-in-out dark:translate-y-10 dark:opacity-0 flex items-center justify-center w-full h-full text-amber-500 group-hover:rotate-45">
                <i className="fa-solid fa-sun text-xl"></i>
              </div>
              <div className="absolute transition-transform duration-500 ease-in-out -translate-y-10 opacity-0 dark:translate-y-0 dark:opacity-100 flex items-center justify-center w-full h-full text-blue-400 group-hover:-rotate-12">
                <i className="fa-solid fa-moon text-lg"></i>
              </div>
            </button>

            {/* Notification */}
            <button className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm">
              <i className="fa-regular fa-bell text-lg"></i>
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-100/80 dark:bg-amber-900/40 backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-4 mb-10 flex items-start gap-4 max-w-3xl shadow-sm transition-colors">
          <div className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <i className="fa-solid fa-exclamation text-sm"></i>
          </div>
          <div>
            <h4 className="text-amber-900 dark:text-amber-400 font-bold mb-0.5 text-sm">
              Dukung Penulis & Penerbit
            </h4>
            <p className="text-amber-800/80 dark:text-amber-200/70 text-xs sm:text-sm leading-relaxed">
              Platform <strong>GoLib</strong> ditujukan sebagai media edukasi.
              Sangat direkomendasikan untuk mendukung karya penulis dengan{" "}
              <strong>membeli buku secara legal</strong> melalui penyedia resmi.
            </p>
          </div>
        </div>

        {/* Continue Reading Section */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-6">
            Continue Reading
          </h2>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 px-1 snap-x scrollbar-hide">
            
            {!user ? (
              <div className="w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 shrink-0">
                  <i className="fa-solid fa-lock text-2xl"></i>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg mb-1">Simpan Progres Membacamu</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 sm:mb-0">Masuk dengan akun Google untuk melanjutkan buku yang sedang dibaca dari perangkat mana saja.</p>
                </div>
                <Link href="/login" className="whitespace-nowrap bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-brand-500/30 transition-all">
                  Masuk
                </Link>
              </div>
            ) : progressBooks.length === 0 ? (
              <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-6 flex items-center gap-4 text-slate-500 dark:text-slate-400">
                <i className="fa-solid fa-book-open-reader text-2xl opacity-50"></i>
                <p className="text-sm font-medium">Belum ada buku yang dibaca. Mulai petualangan pertamamu!</p>
              </div>
            ) : (
              progressBooks.map((b) => {
                const percentage = Math.min(100, Math.round((b.lastPage / b.totalPages) * 100));
                return (
                  <div key={b.id} onClick={() => router.push(`/read/${b.id}?page=${b.lastPage}`)} className="min-w-[300px] sm:min-w-[380px] flex-shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 relative overflow-hidden group snap-start cursor-pointer">
                    <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-colors opacity-10 group-hover:opacity-20`} style={{ backgroundColor: `#${b.coverColor || '3b82f6'}` }}></div>
                    
                    <div className="w-20 h-28 rounded-xl flex-shrink-0 shadow-md transform group-hover:scale-105 transition-transform duration-300 relative overflow-hidden bg-slate-200" style={{ backgroundColor: `#${b.coverColor || '3b82f6'}` }}>
                       <img
                          src={b.coverUrl || `https://placehold.co/400x600/${b.coverColor || "e2e8f0"}/${b.textColor || "1e293b"}?text=${encodeURIComponent((b.title || "Untitled").split(" ").join("\n"))}`}
                          alt={b.title}
                          className="w-full h-full object-cover"
                       />
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate mb-0.5 group-hover:text-brand-500 transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-3">
                        {b.author}
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] sm:text-xs font-medium">
                          <span className="text-slate-600 dark:text-slate-300">Hal {b.lastPage} / {b.totalPages}</span>
                          <span className="text-brand-600 dark:text-brand-400">{percentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full relative" style={{ width: `${percentage}%` }}>
                            <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Book Recommendation Section */}
        <div className="flex items-center justify-between mb-6 pr-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Book Recommendation
          </h2>
          <button className="text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md dark:border dark:border-slate-700 transition-all text-slate-700 dark:text-slate-300">
            View all <i className="fa-solid fa-chevron-right text-[10px] ml-1"></i>
          </button>
        </div>

        <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-10 pt-2 px-2 snap-x scrollbar-hide">
          {loading ? (
            <div className="flex justify-center w-full py-10">
              <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-3xl"></i>
            </div>
          ) : dbBooks.length > 0 ? (
            dbBooks.slice(0, 8).map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => setSelectedBook(book)}
              />
            ))
          ) : (
            <p className="text-slate-500 py-10">Buku tidak ditemukan.</p>
          )}
        </div>

        {/* Book Category Section */}
        <div className="flex items-center justify-between mt-6 mb-4 pr-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Book Category
          </h2>
          <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
            <i className="fa-solid fa-sliders text-sm"></i>
          </button>
        </div>

        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 px-2 scrollbar-hide">
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              category={cat}
              isActive={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Filtered Books for Category */}
        <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-10 px-2 snap-x scrollbar-hide">
          {loading ? (
            <div className="flex justify-center w-full py-10">
              <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-3xl"></i>
            </div>
          ) : filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => setSelectedBook(book)}
              />
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-slate-500">
              <i className="fa-solid fa-book-open-reader text-4xl mb-4 opacity-50"></i>
              <p>Tidak ada buku dalam kategori ini.</p>
            </div>
          )}
        </div>
      </div>

      <OverviewModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRead={() => {
          if (selectedBook) {
            router.push(`/read/${selectedBook.id}`);
          }
          setSelectedBook(null);
        }}
      />
    </>
  );
}
