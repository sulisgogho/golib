"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  
  const popularScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  
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