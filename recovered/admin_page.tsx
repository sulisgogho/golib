"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Book, AppUser } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("English");
  const [pages, setPages] = useState("");
  const [desc, setDesc] = useState("");
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [pdfUrlInput, setPdfUrlInput] = useState("");

  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<"books" | "users">("books");
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "books") {
        fetchBooks();
      } else if (activeTab === "users") {
        fetchUsers();
      }
    }
  }, [isAdmin, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center text-surface-900 p-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
          <i className="fa-solid fa-shield-halved text-4xl"></i>
        </div>
        <h2 className="font-serif text-3xl font-bold mb-3">Access Denied (403)</h2>
        <p className="text-surface-600 text-center max-w-md mb-8">
          You do not have administrator permissions to access this page. Please ensure you are logged in with an admin account.
        </p>
        <Link href="/" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedBooks: Book[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedBooks.push({ id: docSnap.id, ...docSnap.data() } as Book);
      });
      setBooksList(fetchedBooks);
    } catch (error) {
      console.error("Error fetching books: ", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, "users"), orderBy("lastLoginAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: AppUser[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedUsers.push({ id: docSnap.id, ...docSnap.data() } as AppUser);