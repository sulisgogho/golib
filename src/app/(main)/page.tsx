"use client";

import { useState, useMemo, useEffect } from "react";
import BookCard from "@/components/BookCard";
import CategoryPill from "@/components/CategoryPill";
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
  const [dbBooks, setDbBooks] = useState<Book[]>(booksData);
  const [loading, setLoading] = useState(true);
  const [progressBooks, setProgressBooks] = useState<ProgressBook[]>([]);
  const [popularIds, setPopularIds] = useState<string[]>([]);

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

    // Load popular book IDs from admin settings (real-time)
    const unsubPopular = onSnapshot(doc(db, "settings", "popular"), (snap) => {
      if (snap.exists()) setPopularIds(snap.data().ids || []);
    }, (error) => {
      console.error("Error fetching popular settings:", error);
    });

    return () => unsubPopular();
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
      <div className="flex h-full w-full relative bg-[#FDFBF7]">
        {/* Dynamic Background Split for Desktop */}
        <div className="hidden xl:block absolute inset-0 pointer-events-none z-0">
          <div className="w-[55%] h-full bg-[#F1EEE3] float-left"></div>
          <div className="w-[45%] h-full bg-[#FDFBF7] float-left"></div>
        </div>
        {/* Main Content */}
        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-8 sm:px-16 xl:px-20 pt-8 sm:pt-12 pb-28 md:pb-12 scrollbar-hide">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-16 w-full">
            <div className="relative flex-1 max-w-sm">
              <i className="fa-solid fa-search absolute left-0 top-1/2 -translate-y-1/2 text-surface-600 text-sm"></i>
              <input
                type="text"
                placeholder="Search book name, author, edition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-2.5 pl-8 pr-4 text-sm text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-0"
              />
            </div>
            {/* Actions / Profile for mobile and desktop */}
            <div className="flex items-center gap-6 shrink-0">
              {user ? (
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=df6861&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <span className="text-sm font-medium text-surface-900 hidden sm:block">{user.displayName}</span>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium text-surface-900 hover:text-brand-500 transition-colors">Sign In</Link>
              )}
              <button className="text-surface-800 hover:text-brand-500 transition-colors">
                <i className="fa-regular fa-bell text-lg"></i>
              </button>
            </div>
          </div>

          {/* Hero Section */}
          {(() => {
            const featuredBook = progressBooks.length > 0 ? progressBooks[0] : (dbBooks.length > 0 ? dbBooks[0] : null);
            if (!featuredBook) return null;
            return (
              <div className="flex flex-col xl:flex-row gap-12 xl:gap-8 mb-12 items-center xl:items-stretch">
                {/* Left Column: Greeting */}
                <div className="w-full xl:w-1/3 flex flex-col justify-center text-center xl:text-left">
                  <h1 className="font-serif text-5xl sm:text-6xl text-surface-950 mb-4 sm:mb-8 leading-[1.1]">
                    <span className="font-bold">Happy reading,</span> <br />
                    <span className="text-[#D5635C] font-normal">{user?.displayName?.split(" ")[0] || "Guest"}</span>.
                  </h1>
                  <p className="text-surface-800 text-sm sm:text-base leading-relaxed mb-8 font-medium mx-auto xl:mx-0 max-w-sm">
                    Wow! you've delved deep into the wizarding world's secrets.
                    Have Harry's parents died yet? Oops, looks like you're not
                    there yet. Get reading now!
                  </p>
                  <div>
                    <button
                      onClick={() => router.push(`/read/${featuredBook.id}`)}
                      className="bg-surface-800 hover:bg-black text-white px-6 py-3 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-lg"
                    >
                      Start reading <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                    </button>
                  </div>
                </div>

                {/* Center Column: The Open Book */}
                <div className="w-full xl:w-1/3 flex justify-center items-center py-6">
                  <div className="w-full max-w-[440px] aspect-[1.4] flex shadow-[20px_30px_60px_rgba(0,0,0,0.25)] rounded-sm transform md:-rotate-2 transition-transform hover:rotate-0 duration-500 cursor-pointer" onClick={() => router.push(`/read/${featuredBook.id}`)}>
                    {/* Left Page (Text) */}
                    <div className="flex-1 bg-[#fdfdfd] border border-[#e2e8f0] border-r-0 rounded-l-md shadow-[inset_-12px_0_30px_-7px_rgba(0,0,0,0.15),inset_2px_0_5px_rgba(255,255,255,1)] overflow-hidden relative p-4 sm:p-5 text-[7px] sm:text-[9px] md:text-[10px] text-surface-700 font-serif leading-relaxed flex flex-col justify-between">
                      <div>
                        <div className="w-full text-center font-bold mb-4 sm:mb-6 text-surface-950 text-[9px] sm:text-[11px] tracking-widest uppercase">Chapter One</div>
                        <p className="mb-3 text-justify indent-4">The boy with the lightning scar looked around the room, sensing a deep magic in the air. Every shadow seemed to hold a secret, waiting to be uncovered in the silence of the night.</p>
                        <p className="mb-3 text-justify indent-4">"It's not just about the wand," the old wizard had said, his voice echoing in the boy's mind. "It's about the intent behind it. Magic is woven from willpower and imagination."</p>
                        <p className="mb-3 text-justify indent-4">Suddenly, a soft glow emanated from the corner of the room, revealing a hidden passage. His heart raced with anticipation as he took a cautious step forward into the unknown.</p>
                      </div>
                      <div className="w-full text-center text-surface-400">1</div>
                    </div>
                    {/* Right Page (Image) */}
                    <div className="flex-1 bg-surface-300 border border-[#e2e8f0] border-l-0 rounded-r-md shadow-[inset_12px_0_30px_-7px_rgba(0,0,0,0.2),inset_-2px_0_5px_rgba(255,255,255,0.5)] overflow-hidden relative">
                      <img
                        src={featuredBook.coverUrl || `https://placehold.co/400x600/${featuredBook.coverColor || "e2e8f0"}/${featuredBook.textColor || "1e293b"}?text=${encodeURIComponent((featuredBook.title || "Untitled").split(" ").join("\n"))}`}
                        alt={featuredBook.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 shadow-[inset_12px_0_30px_-7px_rgba(0,0,0,0.3)] pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Book Info */}
                <div className="w-full xl:w-1/3 flex flex-col justify-center text-center xl:text-left">
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-surface-950 mb-4 leading-snug">
                    {featuredBook.title}
                  </h2>
                  <p className="text-brand-600 font-medium text-sm sm:text-base mb-6">
                    {featuredBook.pages ? `${(progressBooks.find(b => b.id === featuredBook.id)?.lastPage || 0)} / ${featuredBook.pages} pages` : 'Ready to start'}
                  </p>
                  <p className="text-surface-700 text-sm sm:text-base leading-relaxed line-clamp-4 mb-6 mx-auto xl:mx-0 max-w-sm">
                    {featuredBook.desc || "A magical adventure awaits you in this fascinating book. Discover secrets, explore new worlds, and meet unforgettable characters."}
                  </p>
                  <p className="text-surface-900 text-sm italic font-medium mx-auto xl:mx-0 xl:ml-auto">
                    - {featuredBook.author}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Search Results OR Normal sections */}
          {searchQuery ? (
            /* Search Results */
            <section>
              <div className="flex items-center justify-between mb-0 relative z-0">
                <h2 className="text-2xl sm:text-3xl font-serif text-surface-950">
                  Results for &ldquo;{searchQuery}&rdquo;
                </h2>
                <span className="text-sm text-surface-500">{filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found</span>
              </div>
              <div className="flex gap-6 sm:gap-10 overflow-x-auto pt-16 pb-12 snap-x scrollbar-hide relative z-10 -mt-8 -ml-2 pl-2">
                {loading ? (
                  <div className="flex justify-center w-full py-10">
                    <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-2xl"></i>
                  </div>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} size="large" />
                  ))
                ) : (
                  <div className="w-full py-12 flex flex-col items-center justify-center text-surface-400">
                    <i className="fa-solid fa-magnifying-glass text-3xl mb-4 opacity-40"></i>
                    <p className="text-sm">No books match your search.</p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              {/* Popular Now */}
              <section className="mb-0">
                <div className="flex items-center justify-between mb-4 md:mb-6 relative z-0">
                  <h2 className="text-2xl sm:text-3xl font-serif text-surface-950">Popular Now</h2>
                  <div className="flex gap-2 text-surface-900">
                    <i className="fa-solid fa-circle text-[6px]"></i>
                    <i className="fa-regular fa-circle text-[6px]"></i>
                  </div>
                </div>
                <div className="flex gap-10 sm:gap-16 overflow-x-auto pt-16 pb-12 snap-x scrollbar-hide relative z-10 -mt-8 -ml-2 pl-2">
                  {loading ? (
                    <div className="flex justify-center w-full py-10">
                      <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-2xl"></i>
                    </div>
                  ) : (() => {
                    const popularBooks = popularIds.length > 0
                      ? popularIds.map(id => dbBooks.find(b => String(b.id) === id)).filter(Boolean) as Book[]
                      : dbBooks.slice(0, 10);
                    const displayedBooks = popularBooks.slice(0, 10);
                    return displayedBooks.length > 0
                      ? displayedBooks.map((book) => (
                          <BookCard key={book.id} book={book} onClick={() => router.push(`/book/${book.id}`)} size="large" />
                        ))
                      : <p className="text-surface-500 py-10">No books found.</p>;
                  })()}
                </div>
              </section>

              {/* Browse by Category */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl sm:text-3xl font-serif text-surface-950">Browse by category</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide relative z-0">
                  {categories.map((cat) => (
                    <CategoryPill
                      key={cat}
                      category={cat}
                      isActive={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                    />
                  ))}
                </div>

                <div className="flex gap-6 sm:gap-10 overflow-x-auto pt-16 pb-12 snap-x scrollbar-hide relative z-10 -mt-10">
                  {loading ? (
                    <div className="flex justify-center w-full py-10">
                      <i className="fa-solid fa-circle-notch fa-spin text-brand-500 text-2xl"></i>
                    </div>
                  ) : filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => (
                      <BookCard key={book.id} book={book} onClick={() => router.push(`/book/${book.id}`)} />
                    ))
                  ) : (
                    <div className="w-full py-12 flex flex-col items-center justify-center text-surface-400">
                      <i className="fa-solid fa-book-open-reader text-3xl mb-4 opacity-40"></i>
                      <p className="text-sm">No books in this category.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>


      </div>

    </>
  );
}

