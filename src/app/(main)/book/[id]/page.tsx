"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function BookOverviewPage() {
  const { user, userData, canRead, trialDaysLeft } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const fetchedRef = useRef(false);

  const bookId = params?.id as string;

  useEffect(() => {
    // Ensure body scroll is unlocked (in case a modal left it locked)
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "auto";

    if (!bookId || fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchBook = async () => {
      try {
        const docRef = doc(db, "books", bookId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book);
        }
      } catch (err) {
        console.error("Error fetching book:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  useEffect(() => {
    if (user && bookId) {
      const checkSaved = async () => {
        try {
          const docRef = doc(db, `users/${user.uid}/savedBooks/${bookId}`);
          const snap = await getDoc(docRef);
          setIsSaved(snap.exists());
        } catch (err) {
          console.error("Error checking saved state:", err);
        }
      };
      checkSaved();
    }
  }, [user, bookId]);

  const handleToggleBookmark = async () => {
    if (!user) {
      alert("Please sign in to save books.");
      return;
    }
    try {
      const docRef = doc(db, `users/${user.uid}/savedBooks/${bookId}`);
      if (isSaved) {
        await deleteDoc(docRef);
        setIsSaved(false);
      } else {
        await setDoc(docRef, { savedAt: Date.now() });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const handleShare = async () => {
    if (!book) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: book.title,
          text: `Check out this book: ${book.title}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Buku tidak ditemukan</h1>
        <button onClick={() => router.back()} className="px-6 py-2 bg-brand-500 text-white rounded-full">
          Kembali
        </button>
      </div>
    );
  }

  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "e2e8f0"}/${
    book.textColor || "1e293b"
  }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  const handleReadClick = () => {
    if (!user) {
      router.push("/login");
    } else if (!canRead) {
      alert("Masa trial habis. Silakan hubungi admin ke email goghotech123@gmail.com");
    } else {
      router.push(`/read/${book.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1E8] dark:bg-slate-900 overflow-x-hidden w-full mx-auto">
      
      {/* Top Beige Area (Navbar + Spacer) */}
      <div className="w-full flex flex-col relative z-0 h-[35vh] min-h-[250px] md:h-[65vh] md:min-h-[450px]">
        
        {/* Header / Navbar */}
        <div className="flex items-center justify-between gap-4 w-full px-6 md:px-12 pt-8 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <i className="fa-solid fa-search absolute left-0 top-1/2 -translate-y-1/2 text-surface-600 text-sm"></i>
            <input
              type="text"
              placeholder="Search book name, author, edition..."
              className="w-full bg-transparent border-none py-2.5 pl-8 pr-4 text-sm text-surface-900 dark:text-white placeholder-surface-500 focus:outline-none focus:ring-0"
            />
          </div>
          {/* Actions / Profile */}
          <div className="flex items-center gap-6 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=df6861&color=fff`}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <span className="text-sm font-medium text-surface-900 dark:text-white hidden sm:block">{user.displayName}</span>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-surface-900 dark:text-white hover:text-brand-500 transition-colors">Sign In</Link>
            )}
            <button className="text-surface-800 dark:text-surface-300 hover:text-brand-500 transition-colors">
              <i className="fa-regular fa-bell text-lg"></i>
            </button>
          </div>
        </div>

        {/* Top Beige Spacer */}
        <div className="w-full flex-1 relative mt-4 md:mt-8">
          <div className="w-full lg:w-[85%] xl:w-[75%] mx-auto relative h-full px-6 md:px-0">
            {/* Back Button */}
            <button onClick={() => router.back()} className="absolute top-0 left-6 md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors">
              <i className="fa-solid fa-arrow-left text-slate-700 dark:text-slate-300"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main White Card */}
      <div className="bg-white dark:bg-slate-950 w-full lg:w-[85%] xl:w-[75%] mx-auto flex-1 px-6 md:px-12 pt-0 pb-20 relative z-10 md:rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        {/* Wrapper to shift ALL content upwards relative to the white card */}
        <div className="-mt-48 md:-mt-[450px] relative z-20">
          
          {/* Desktop Back Button */}
          <button onClick={() => router.back()} className="hidden md:flex absolute top-36 -left-12 w-10 h-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors z-50">
            <i className="fa-solid fa-arrow-left text-slate-700 dark:text-slate-300"></i>
          </button>

          {/* Top Info Section (Cover + Title) */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative pb-0 md:pb-0 border-b border-transparent">
            
            {/* Left cover container (Overlapping the white card) */}
            <div className="w-full md:w-[45%] flex justify-center md:justify-end relative mb-8 md:mb-0 mt-12 md:mt-36">
               <div className="w-[180px] sm:w-[220px] md:w-full max-w-[280px] shadow-2xl rounded-sm overflow-hidden">
                  <img src={coverUrl} className="w-full h-auto object-cover" alt="Cover" />
               </div>
            </div>
            
            {/* Right text info */}
            <div className="w-full md:w-[55%] flex flex-col justify-center">
               <h1 className="text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-4 leading-[1.1]">{book.title}</h1>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">{book.author}</h3>
               <p className="text-slate-600 dark:text-slate-400 italic max-w-xl text-lg mb-8 md:mb-0">
                  Explore this amazing book and dive into an unforgettable journey. A thrilling adventure awaits you.
               </p>
            </div>
          </div>
          
          {/* Bottom Content Section Wrapper */}
          <div className="mt-0 md:-mt-[90px] relative z-30 flex flex-col w-full">
          
             {/* Action Buttons Row */}
             <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* Empty spacer for desktop to offset the overlapping cover */}
                <div className="hidden md:block md:w-[45%]"></div>

                {/* Content */}
                <div className="w-full md:w-[55%] flex flex-col">
                  
                   {/* Trial Notice (if any) */}
             {user && userData && !userData.isApproved && trialDaysLeft > 0 && (
               <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-sm flex items-center gap-3 border border-blue-100 dark:border-blue-800">
                 <i className="fa-solid fa-clock-rotate-left text-lg"></i>
                 <span>Sisa masa trial Anda: <strong className="text-lg">{trialDaysLeft} hari</strong></span>
               </div>
             )}

             {/* Action buttons */}
             <div className="flex flex-wrap items-center gap-4 mb-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                <button 
                   onClick={handleReadClick}
                   className={`px-8 py-3.5 rounded-full font-medium flex items-center gap-3 transition-colors ${!user ? 'bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white' : !canRead ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white'}`}
                >
                   {!user ? "Sign In to Read" : !canRead ? "Trial Expired" : "Start reading"} 
                   <i className={`fa-solid ${!user ? 'fa-lock' : !canRead ? 'fa-envelope' : 'fa-arrow-up-right'}`}></i>
                </button>
                
                {/* Bookmark */}
                <button 
                   onClick={handleToggleBookmark}
                   className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${isSaved ? 'bg-brand-500/10 text-brand-500 hover:bg-brand-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                   <i className={`${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark text-lg`}></i>
                </button>
                {/* Share */}
                <button 
                   onClick={handleShare}
                   className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                   <i className="fa-solid fa-share-nodes text-lg"></i>
                </button>
             </div>
             </div>
             </div>
             
             {/* Description & Metadata (Full Width) */}
             <div className="w-full mt-8 md:mt-12 pt-4 px-4 md:pl-16 lg:pl-32 xl:pl-40">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-32">
                {/* Description */}
                <div className="flex-1 lg:w-[75%]">
                   <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Description</h4>
                   <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap line-clamp-8">{book.desc || "Explore this amazing book and dive into an unforgettable journey. A thrilling adventure awaits you."}</p>
                </div>
                {/* Metadata */}
                <div className="w-full lg:w-[25%] flex flex-col gap-8 shrink-0">
                   <div>
                      <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Category</h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">{book.category || "Uncategorized"}</p>
                   </div>
                   <div>
                      <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Language</h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">{book.language || "English"}</p>
                   </div>
                   <div className="pb-24 md:pb-0">
                      <h5 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Pages</h5>
                      <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">{book.pages || "-"} pages</p>
                   </div>
                </div>
             </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
