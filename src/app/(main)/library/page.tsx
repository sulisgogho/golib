"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDoc, doc, onSnapshot } from "firebase/firestore";
import { Book } from "@/types";
import BookCard from "@/components/BookCard";

type ProgressBook = Book & { lastPage: number; totalPages: number; updatedAt: number; completed?: boolean };

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [progressBooks, setProgressBooks] = useState<ProgressBook[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const visibleIndicesRef = useRef<Set<number>>(new Set());
  const isScrollingRef = useRef(false);
  
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

  useEffect(() => {
    if (!carouselRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          if (entry.target.hasAttribute("data-index")) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) {
              if (entry.isIntersecting) {
                visibleIndicesRef.current.add(idx);
                changed = true;
              } else {
                visibleIndicesRef.current.delete(idx);
                changed = true;
              }
            }
          }
        });
        
        if (changed && visibleIndicesRef.current.size > 0 && !isScrollingRef.current) {
          setActiveIndex(Math.min(...Array.from(visibleIndicesRef.current)));
        }
      },
      {
        root: carouselRef.current,
        threshold: 0.5,
      }
    );

    const children = carouselRef.current.children;
    Array.from(children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [progressBooks]);

  const scrollLeft = () => {
    if (carouselRef.current && activeIndex > 0) {
      isScrollingRef.current = true;
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      // Add 1 to the index to account for the mobile spacer div at the start of the container
      const child = carouselRef.current.children[newIndex + 1] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: window.innerWidth < 640 ? "center" : "start" });
      }
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current && activeIndex < progressBooks.length - 1) {
      isScrollingRef.current = true;
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      // Add 1 to the index to account for the mobile spacer div at the start of the container
      const child = carouselRef.current.children[newIndex + 1] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: window.innerWidth < 640 ? "center" : "start" });
      }
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        const btn = document.getElementById("carousel-btn-left");
        if (btn) btn.click();
      } else if (e.key === "ArrowRight") {
        const btn = document.getElementById("carousel-btn-right");
        if (btn) btn.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-surface-500"></i>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-full bg-[#FDFBF7] text-surface-900 p-6 sm:p-10 flex flex-col items-center justify-center pt-32">
        <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-500">
          <i className="fa-solid fa-lock text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-3">Akses Terkunci</h2>
        <p className="text-surface-500 text-center max-w-md mb-8">
          Silakan masuk terlebih dahulu untuk mengakses perpustakaan pribadimu, menyimpan buku, dan melacak progres membaca.
        </p>
        <Link href="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2">
          <i className="fa-solid fa-arrow-right-to-bracket"></i> Masuk Sekarang
        </Link>
      </div>
    );
  }
  const featuredBook = progressBooks.length > 0 ? progressBooks[activeIndex] || progressBooks[0] : null;

  return (
    <div className="flex h-full w-full relative bg-[#FDFBF7]">
      {/* Background Split */}
      <div className="hidden xl:block absolute inset-0 pointer-events-none z-0">
        <div className="w-[45%] h-full bg-[#FDFBF7] float-left"></div>
        <div className="w-[55%] h-full bg-[#F1EEE3] float-left"></div>
      </div>
      
      <div className="relative z-10 flex-1 overflow-y-auto px-8 sm:px-16 xl:px-20 pt-8 sm:pt-12 pb-28 md:pb-12 w-full max-w-[1920px] mx-auto scrollbar-hide">
        
        {/* Header / Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-8 w-full">
            <div className="relative flex-1 max-w-sm">
              <i className="fa-solid fa-search absolute left-0 top-1/2 -translate-y-1/2 text-surface-600 text-sm"></i>
              <input
                type="text"
                placeholder="Search book name, author, edition..."
                className="w-full bg-transparent border-none py-2.5 pl-8 pr-4 text-sm text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-0"
              />
            </div>
            {/* Actions / Profile */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=df6861&color=fff`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <span className="text-sm font-medium text-surface-900 hidden sm:block">{user.displayName}</span>
              </div>
              <button className="text-surface-800 hover:text-brand-500 transition-colors">
                <i className="fa-regular fa-bell text-lg"></i>
              </button>
            </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col xl:flex-row items-start gap-12 xl:gap-24 mb-8">
          {/* Left Hero */}
          <div className="w-full xl:w-[45%] flex flex-col pr-0 xl:pr-10">
            <h1 className="text-3xl sm:text-5xl lg:text-[64px] leading-[1.1] font-bold text-surface-950 tracking-tight mb-6 whitespace-nowrap">
              Keep the <span className="font-serif italic text-brand-500 font-light mr-2">story</span>going..
            </h1>
            <p className="text-lg font-semibold text-surface-600 mb-8 max-w-xl">
              Don't let the story end just yet. Continue reading your last book and immerse yourself in the world of literature.
            </p>
            {featuredBook && (
              <div>
                <button
                  onClick={() => router.push(`/read/${featuredBook.id}?page=${featuredBook.lastPage}`)}
                  className="bg-[#2D2D2D] hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2"
                >
                  Start reading <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </button>
              </div>
            )}
          </div>
          
          {/* Right Hero (Author info) */}
          {featuredBook && (
            <div className="w-full xl:w-[55%] flex flex-col pt-2 xl:pl-32">
              <div className="flex items-start gap-5 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-surface-300">
                  <img src={`https://ui-avatars.com/api/?name=${featuredBook.author}&background=random`} alt={featuredBook.author} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-surface-950 text-xl">{featuredBook.author}</h3>
                    <button className="text-surface-500 hover:text-surface-950"><i className="fa-solid fa-ellipsis"></i></button>
                  </div>
                  <p className="text-sm text-surface-500 mb-4">author</p>
                  <p className="text-base text-surface-700 leading-relaxed italic w-full line-clamp-3">
                    {featuredBook.desc}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Navigation */}
        <div className="flex justify-end gap-8 items-center -mt-10 relative z-20">
          <button id="carousel-btn-left" onClick={scrollLeft} className="w-12 h-12 flex items-center justify-center rounded-full border border-surface-300 text-surface-600 hover:text-surface-950 hover:border-surface-950 transition-colors">
            <i className="fa-solid fa-arrow-left-long text-xl"></i>
          </button>
          <button id="carousel-btn-right" onClick={scrollRight} className="w-12 h-12 flex items-center justify-center rounded-full border border-surface-300 text-surface-600 hover:text-surface-950 hover:border-surface-950 transition-colors">
            <i className="fa-solid fa-arrow-right-long text-xl"></i>
          </button>
        </div>

        {/* Book Carousel */}
        <div ref={carouselRef} className="flex gap-10 sm:gap-16 overflow-x-auto pt-16 pb-4 snap-x scrollbar-hide relative z-10 -mt-8">
          {/* Mobile start spacer */}
          <div className="shrink-0 w-[calc(50vw-128px)] sm:hidden"></div>
          
          {progressBooks.length > 0 ? (
            progressBooks.map((book, idx) => {
               const percentage = Math.min(100, Math.round((book.lastPage / book.totalPages) * 100));
               
               return (
                  <BookCard
                    key={book.id}
                    book={book}
                    size="large"
                    isActive={idx === activeIndex}
                    titleLines={1}
                    data-index={idx}
                    percentage={percentage}
                    subtitle={`${book.lastPage} / ${book.totalPages}`}
                    onClick={() => router.push(`/read/${book.id}?page=${book.lastPage}`)}
                  />
               );
            })
          ) : (
            <div className="w-full text-center py-20 text-surface-500 italic">
              Belum ada buku yang sedang dibaca.
            </div>
          )}
          
          {/* Mobile end spacer */}
          <div className="shrink-0 w-[calc(50vw-128px)] sm:hidden"></div>
        </div>

        {/* Book Count Indicator */}
        {progressBooks.length > 0 && (
          <div className="flex justify-end mt-4 xl:-mt-2 relative z-20">
            <span className="text-surface-950 font-bold text-lg">
              <span className="text-[#D5635C]">{String(activeIndex + 1).padStart(2, '0')}</span>/{String(progressBooks.length).padStart(2, '0')} books
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
