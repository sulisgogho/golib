"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { Book } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function BookOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!params.id) return;
    const fetchBook = async () => {
      try {
        const bookDoc = await getDoc(doc(db, "books", params.id as string));
        if (bookDoc.exists()) {
          setBook({ id: bookDoc.id, ...bookDoc.data() } as Book);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [params.id, router]);

  useEffect(() => {
    if (!user || !book) return;
    const docRef = doc(db, `users/${user.uid}/savedBooks`, book.id as string);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setIsSaved(docSnap.exists());
    });
    return () => unsubscribe();
  }, [user, book]);

  const handleToggleSave = async () => {
    if (!user || !book || isSaving) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, `users/${user.uid}/savedBooks`, book.id as string);
      if (isSaved) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { savedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F1EEE3] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!book) return null;

  const coverUrl = book.coverUrl || `https://placehold.co/400x600/27272a/fafafa?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  return (
    <div className="min-h-screen w-full relative flex flex-col bg-[#F1EEE3]">
      
      {/* Bottom Background (White box for content) */}
      <div className="absolute top-[35vh] lg:top-[45vh] bottom-0 left-0 lg:left-[10%] xl:left-[15%] right-0 lg:right-[10%] xl:right-[15%] bg-[#FDFBF7] z-0 shadow-sm border-t border-surface-200/50"></div>
      
      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1920px] mx-auto overflow-y-auto overflow-x-hidden scrollbar-hide pb-20 md:pb-0">
        
        {/* Top Bar (Search + Profile) */}
        <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between gap-6 md:gap-0 px-8 sm:px-16 xl:px-32 pt-8 sm:pt-10 mb-6 xl:mb-10">
          {/* Search */}
          <div className="w-full md:w-1/2">
            <div className="relative max-w-md">
              <i className="fa-solid fa-search absolute left-0 top-1/2 -translate-y-1/2 text-surface-500 text-sm"></i>
              <input
                type="text"
                placeholder="Search book name, author, edition ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-2 pl-8 pr-4 text-sm text-surface-900 placeholder-surface-500 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
          
          {/* Profile */}
          <div className="w-full md:w-1/2 flex justify-end">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || "User"}&background=df6861&color=fff`}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm"
                />
                <span className="text-sm font-semibold text-surface-900">{user?.displayName}</span>
              </div>
              <button className="text-surface-800 hover:text-brand-500 transition-colors">
                <i className="fa-regular fa-bell text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Hero / Cover Section */}
        <div className="flex flex-col lg:flex-row px-8 sm:px-16 xl:px-40 relative z-20 mb-8 lg:mb-0">
          
          {/* Cover Art - Positioned to overhang */}
          <div className="w-full lg:w-1/3 flex justify-center lg:justify-start lg:-mb-40 relative z-30 shrink-0">
            <img 
              src={coverUrl} 
              alt={book.title} 
              className="w-[200px] sm:w-[240px] lg:w-full lg:max-w-[340px] rounded-sm shadow-2xl object-cover aspect-[2/3]"
            />
          </div>

          {/* Title & Author Area (Beige part) */}
          <div className="w-full lg:w-2/3 flex flex-col justify-center pt-8 lg:pt-10 lg:pl-12 xl:pl-16">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-serif text-surface-950 mb-4 leading-tight">
              {book.title}
            </h1>
            <h2 className="text-lg sm:text-xl font-bold text-surface-900 mb-6">
              {book.author}
            </h2>
            <p className="text-surface-700 italic max-w-lg mb-8 leading-relaxed text-sm sm:text-base">
              Get ready to uncover the dark secrets and betrayals in the book. A thrilling adventure awaits you.
            </p>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-6">
              <Link 
                href={`/read/${book.id}`}
                className="bg-[#2D2E32] hover:bg-black text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-3 text-sm"
              >
                Start reading <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </Link>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border border-transparent ${
                    isSaved ? "bg-brand-100 text-brand-600 border-brand-200" : "bg-transparent hover:bg-surface-200 text-surface-700 border-surface-300"
                  }`}
                  title={isSaved ? "Remove from Bookmarks" : "Save Bookmark"}
                >
                  <i className={isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-transparent hover:bg-surface-200 text-surface-700 border border-surface-300 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-share-nodes text-sm"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-transparent hover:bg-surface-200 text-surface-700 border border-surface-300 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-download text-sm"></i>
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block w-full h-[1px] bg-surface-200 mt-10"></div>
          </div>
        </div>

        {/* Details Section (White box content) */}
        <div className="w-full flex flex-col lg:flex-row px-8 sm:px-16 xl:px-40 pt-12 lg:pt-32 pb-24 relative z-10 flex-1">
          
          {/* Left Column (Description) */}
          <div className="w-full lg:w-1/2 lg:pr-20 mb-12 lg:mb-0">
            <h3 className="text-lg font-bold text-surface-950 mb-6">Description</h3>
            <div className="text-surface-700 text-sm leading-loose space-y-6 mb-12 text-justify">
              <p>{book.desc}</p>
            </div>
            
            {/* Mock Review */}
            <div className="flex items-start gap-4">
              <img 
                src="https://ui-avatars.com/api/?name=Roberto+Jordan&background=random" 
                alt="Reviewer" 
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-surface-950 text-sm mb-1">Roberto Jordan</h4>
                <p className="text-surface-600 italic text-sm leading-relaxed">
                  What a delightful and magical book it is! It indeed transports readers to the wizarding world.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Metadata) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-10 lg:pl-10">
            <div>
              <h3 className="text-base font-bold text-surface-950 mb-3">Editors</h3>
              <p className="text-surface-600 text-sm leading-relaxed">
                {book.author} (author), Christopher Reath, Alena Gestabon, Steve Korg
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-surface-950 mb-3">Language</h3>
              <p className="text-surface-600 text-sm leading-relaxed">
                {book.language === "en" ? "Standard English (USA & UK)" : book.language === "id" ? "Indonesian" : book.language}
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-surface-950 mb-3">Paperback</h3>
              <p className="text-surface-600 text-sm leading-relaxed">
                paper textured, full colour, {book.pages} pages <br/>
                ISBN: 987 3 32564 455 B
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}