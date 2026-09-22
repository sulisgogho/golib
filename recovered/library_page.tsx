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
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredBooks = progressBooks.filter((book) => {
    if (!searchQuery) return true;
    const matchSearch =
      (book.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||