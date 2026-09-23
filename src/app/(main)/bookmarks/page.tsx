"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { Book } from "@/types";
import BookCard from "@/components/BookCard";

export default function BookmarksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setSavedBooks([]);
      return;
    }

    const q = collection(db, `users/${user.uid}/savedBooks`);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const books: Book[] = [];
        for (const pDoc of snapshot.docs) {
          const bookDoc = await getDoc(doc(db, "books", pDoc.id));
          if (bookDoc.exists()) {
            books.push({
              id: pDoc.id,
              ...bookDoc.data(),
            } as Book);
          }
        }
        setSavedBooks(books);
      } catch (err) {
        console.error("Error processing savedBooks snapshot", err);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const filteredBooks = useMemo(() => {
    return savedBooks.filter(book => {
      const title = book.title || "";
      const author = book.author || "";
      return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [savedBooks, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center w-full">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-surface-900 p-6 sm:p-10 transition-colors flex flex-col items-center justify-center w-full">
        <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mb-6 text-brand-500 shadow-inner">
          <i className="fa-solid fa-lock text-4xl"></i>
        </div>
        <h2 className="text-2xl font-serif font-bold mb-3">Access Locked</h2>
        <p className="text-surface-500 text-center max-w-md mb-8">
          Please sign in to view your curated collection of saved books.
        </p>
        <Link href="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
          <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#FDFBF7] flex flex-col">
      {/* Dynamic Background Split for Desktop */}
      <div className="hidden xl:block absolute inset-0 pointer-events-none z-0">
        <div className="w-[45%] h-full bg-[#FDFBF7] float-left"></div>
        <div className="w-[55%] h-full bg-[#F1EEE3] float-left"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col px-8 sm:px-16 xl:px-20 pt-8 sm:pt-12 pb-24 md:pb-8 w-full max-w-[1920px] mx-auto overflow-y-auto overflow-x-hidden scrollbar-hide">

        {/* Top Header Section */}
        <div className="flex flex-col w-full">

          {/* Top Bar (Search + Profile) */}
          <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0 mb-4 xl:mb-6">
            {/* Search (Left/White area) */}
            <div className="w-full xl:w-[45%] mb-6 xl:mb-0">
              <div className="relative max-w-sm">
                <i className="fa-solid fa-search absolute left-0 top-1/2 -translate-y-1/2 text-surface-600 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search in your bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-2 pl-8 pr-4 text-sm text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Profile (Right/Beige area) */}
            <div className="w-full xl:w-[55%] flex xl:justify-end">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=df6861&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md"
                  />
                  <span className="text-sm font-semibold text-surface-900">{user.displayName}</span>
                </div>
                <button className="text-surface-800 hover:text-brand-500 transition-colors ml-4">
                  <i className="fa-regular fa-bell text-xl"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col xl:flex-row w-full mb-8">
            <div className="w-full xl:w-[45%] flex flex-col">
              <h1 className="text-4xl xl:text-5xl font-serif text-surface-950 mb-4 leading-tight">Your Curated Collection</h1>
              <p className="text-surface-700 text-sm xl:text-base max-w-sm mb-8 leading-relaxed">
                Revisit your favorite stories and discover new details in the books you've saved for later.
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative flex-1 w-full flex flex-col justify-start min-h-[450px]">
          {savedBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center z-10 w-full xl:w-[45%] xl:items-start xl:text-left">
              <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mb-8 text-surface-400 shadow-inner">
                <i className="fa-solid fa-bookmark text-4xl"></i>
              </div>
              <h3 className="text-3xl font-serif font-bold mb-4 text-surface-900">No Saved Books</h3>
              <p className="text-surface-500 text-base max-w-sm mb-8 leading-relaxed">
                You haven&apos;t saved any books yet. Explore the discovery page and tap the bookmark icon to save books for later.
              </p>
              <Link href="/" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fa-solid fa-compass"></i> Explore Books
              </Link>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center z-10 w-full xl:w-[45%] xl:items-start xl:text-left">
              <p className="text-surface-500 text-base font-medium">No books match your search.</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-start gap-10 sm:gap-16 xl:gap-24 w-full pt-4 pb-16 relative z-10">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => router.push(`/book/${book.id}`)}
                  size="large"
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
