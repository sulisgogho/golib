"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Book } from "@/types";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const [initialPage, setInitialPage] = useState<number | undefined>(undefined);

  // Extract the ID once. useParams() returns a new object on every render,
  // so we must NOT put `params` in the dependency array — that would re-run
  // the effect on every render, resetting loading state and remounting the PDF.
  const bookId = params?.id as string;

  useEffect(() => {
    // Parse ?page= query parameter safely on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get("page");
      if (pageParam) {
        setInitialPage(parseInt(pageParam, 10));
      }
    }

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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Buku tidak ditemukan</h1>
        <button onClick={() => router.back()} className="px-6 py-2 bg-brand-500 text-white rounded-full">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Kembali"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
            {book.title}
          </h1>
          <p className="text-xs text-slate-400 truncate">{book.author}</p>
        </div>
      </div>

      {/* PDF Container */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-2 py-4 md:px-8 md:py-6">
        <PdfViewer pdfUrl={book.pdfUrl || ""} bookId={book.id.toString()} initialPage={initialPage} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overscroll-behavior: none;
        }
      ` }} />
    </div>
  );
}
