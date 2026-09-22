"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, setDoc, getDoc } from "firebase/firestore";
import { Book } from "@/types";
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

  // Popular Books
  const [popularIds, setPopularIds] = useState<string[]>([]);
  const [savingPopular, setSavingPopular] = useState(false);
  const [popularSuccess, setPopularSuccess] = useState(false);

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

  const loadPopular = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "popular"));
      if (snap.exists()) {
        setPopularIds(snap.data().ids || []);
      }
    } catch (e) {
      console.error("Error loading popular:", e);
    }
  };

  const savePopular = async () => {
    setSavingPopular(true);
    try {
      await setDoc(doc(db, "settings", "popular"), { ids: popularIds });
      setPopularSuccess(true);
      setTimeout(() => setPopularSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving popular:", e);
    } finally {
      setSavingPopular(false);
    }
  };

  const togglePopular = async (id: string) => {
    const next = popularIds.includes(id)
      ? popularIds.filter(p => p !== id)
      : popularIds.length >= 10 ? popularIds : [...popularIds, id];
    setPopularIds(next);
    try {
      await setDoc(doc(db, "settings", "popular"), { ids: next });
    } catch (e) {
      console.error("Error saving popular:", e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBooks();
      loadPopular();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500"></i>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col items-center justify-center text-slate-900 dark:text-white p-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
          <i className="fa-solid fa-shield-halved text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold mb-3">Akses Ditolak (403)</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
          Anda tidak memiliki izin (Admin) untuk mengakses halaman ini. Pastikan Anda masuk menggunakan akun administrator.
        </p>
        <Link href="/" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-500/30 transition-all">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }


  const handleEdit = (book: Book) => {
    setEditId(String(book.id));
    setTitle(book.title || "");
    setAuthor(book.author || "");
    setCategory(book.category || "");
    setLanguage(book.language || "English");
    setPages(book.pages?.toString() || "");
    setDesc(book.desc || "");
    setCoverUrlInput(book.coverUrl || "");
    setPdfUrlInput(book.pdfUrl || "");
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteDoc(doc(db, "books", String(id)));
      setBooksList((prev) => prev.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error deleting book: ", error);
      alert("Failed to delete book.");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setAuthor("");
    setCategory("");
    setLanguage("English");
    setPages("");
    setDesc("");
    setCoverUrlInput("");
    setPdfUrlInput("");
    setCoverFile(null);
    setPdfFile(null);
    
    // Reset file inputs manually since they are uncontrolled for values
    const coverInput = document.getElementById('coverInput') as HTMLInputElement;
    if (coverInput) coverInput.value = "";
    const pdfInput = document.getElementById('pdfInput') as HTMLInputElement;
    if (pdfInput) pdfInput.value = "";
    
    setIsFormVisible(false);
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    
    const res = await fetch("https://api.cloudinary.com/v1_1/dx71ftcwo/auto/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    try {
      let finalCoverUrl = coverUrlInput;
      let finalPdfUrl = pdfUrlInput;

      if (coverFile) {
        finalCoverUrl = await uploadToCloudinary(coverFile);
      } else if (!editId && !finalCoverUrl) {
        throw new Error("Please upload a cover image.");
      }

      if (pdfFile) {
        finalPdfUrl = await uploadToCloudinary(pdfFile);
      } else if (!editId && !finalPdfUrl) {
        throw new Error("Please upload a PDF file.");
      }

      const bookData = {
        title,
        author,
        category,
        language,
        pages: parseInt(pages) || 0,
        desc,
        coverUrl: finalCoverUrl,
        pdfUrl: finalPdfUrl,
      };

      if (editId) {
        // Update existing book
        await updateDoc(doc(db, "books", editId), {
          ...bookData,
          updatedAt: new Date(),
        });
      } else {
        // Add new book
        await addDoc(collection(db, "books"), {
          ...bookData,
          createdAt: new Date()
        });
      }

      setSuccess(true);
      resetForm();
      fetchBooks(); // Refresh list

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving document: ", error);
      const msg = error instanceof Error ? error.message : "Failed to save book. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = booksList.filter(book => 
    (book.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.author || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sand Colored Background Shape */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-[#EBE6DA] dark:bg-slate-800/80 rounded-bl-[3rem] md:rounded-bl-[5rem] pointer-events-none z-0 transition-colors duration-300"></div>

      <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Success Message outside conditional */}
          {success && (
            <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl flex items-start gap-4 transition-all animate-in fade-in slide-in-from-top-4">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <h4 className="font-bold text-green-900 dark:text-green-400">Success!</h4>
                <p className="text-sm text-green-800 dark:text-green-500">The action was completed successfully.</p>
              </div>
            </div>
          )}

          {isFormVisible ? (
            /* ============================================================== */
            /*                         FORM VIEW                              */
            /* ============================================================== */
            <div>
              {/* Header */}
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <button 
                    onClick={resetForm}
                    className="text-slate-500 hover:text-brand-500 transition-colors mb-2 text-sm font-medium flex items-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back to Library
                  </button>
                  <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
                    {editId ? "Edit Book" : "Add New Book"}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    {editId ? "Update book details in the library database." : "Upload a new book to the library database. Fill in the details below."}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-4 transition-all animate-in fade-in slide-in-from-top-4">
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 dark:text-red-400">Error</h4>
                    <p className="text-sm text-red-800 dark:text-red-500">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Text Info */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Book Title</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. The Great Gatsby"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Author</label>
                      <input 
                        type="text" 
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g. F. Scott Fitzgerald"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <div className="relative">
                          <select 
                            required 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            <option value="Education">Education</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Self-Development">Self-Development</option>
                            <option value="Business & Finance">Business & Finance</option>
                            <option value="Science & Technology">Science & Technology</option>
                            <option value="Humanities">Humanities</option>
                            <option value="Reference">Reference</option>
                            <option value="Scientific Works">Scientific Works</option>
                            <option value="Filsafat">Filsafat</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                        <div className="relative">
                          <select 
                            required 
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="English">English</option>
                            <option value="Indonesian">Indonesian</option>
                          </select>
                          <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Number of Pages</label>
                      <input 
                        type="number" 
                        required
                        min="1"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder="e.g. 240"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Synopsis / Description</label>
                      <textarea 
                        required
                        rows={4}
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Brief description of the book..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Right Column: File Uploads */}
                  <div className="space-y-6">
                    {/* Book Cover Upload */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Book Cover Image</label>
                      <input 
                        type="file"
                        id="coverInput"
                        accept="image/*"
                        onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                      />
                      {editId && coverUrlInput && !coverFile && (
                        <p className="text-xs text-brand-500 mt-2">
                          Leave empty to keep existing cover.
                        </p>
                      )}
                      {!editId && <p className="text-xs text-slate-500 mt-2">Upload a cover image for the book.</p>}
                    </div>

                    {/* Book PDF Upload */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Book Content (PDF)</label>
                      <input 
                        type="file"
                        id="pdfInput"
                        accept="application/pdf"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      {editId && pdfUrlInput && !pdfFile && (
                        <p className="text-xs text-brand-500 mt-2">
                          Leave empty to keep existing PDF.
                        </p>
                      )}
                      {!editId && <p className="text-xs text-slate-500 mt-2">Upload the PDF file to be read by users.</p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-10 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-8 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#24403B] hover:bg-[#1a2f2b] dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#24403B]/20 dark:shadow-brand-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        Uploading & Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        {editId ? "Update Book" : "Save Book"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================== */
            /*                         LIST VIEW                              */
            /* ============================================================== */
            <div>


              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
                    Manage Library
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    View, search, edit, or remove books from the library.
                  </p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 md:w-64">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="text" 
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors shadow-sm"
                    />
                  </div>
                  
                  {/* Add New Book Button */}
                  <button 
                    onClick={() => setIsFormVisible(true)}
                    className="bg-[#24403B] hover:bg-[#1a2f2b] dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-bold py-2.5 px-5 rounded-full flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="hidden sm:inline">Add Book</span>
                  </button>
                </div>
              </div>

              {/* Book List Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800">
                        <th className="p-4 font-semibold w-1/3">Title & Author</th>
                        <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                        <th className="p-4 font-semibold text-center">Popular</th>
                        <th className="p-4 font-semibold text-center w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingBooks ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-500">
                            <i className="fa-solid fa-circle-notch fa-spin text-2xl mb-2 text-brand-500"></i>
                            <p>Loading books...</p>
                          </td>
                        </tr>
                      ) : filteredBooks.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-12 text-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                              <i className="fa-solid fa-book-open text-2xl"></i>
                            </div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No books found</p>
                            <p className="text-sm">Try a different search term or add a new book.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredBooks.map((book) => (
                          <tr key={book.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-14 bg-cover bg-center rounded overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700"
                                  style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : `url(https://placehold.co/400x600/e2e8f0/1e293b?text=${book.title})` }}
                                ></div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white line-clamp-1" title={book.title}>{book.title || "Untitled"}</p>
                                  <p className="text-xs text-slate-500 line-clamp-1">{book.author || "Unknown Author"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell text-sm text-slate-600 dark:text-slate-400">
                              {book.category}
                            </td>
                            <td className="p-4 text-center">
                              {(() => {
                                const isPopular = popularIds.includes(String(book.id));
                                return (
                                  <button
                                    onClick={() => togglePopular(String(book.id))}
                                    disabled={!isPopular && popularIds.length >= 10}
                                    title={isPopular ? `Popular #${popularIds.indexOf(String(book.id)) + 1} — click to remove` : popularIds.length >= 10 ? 'Max 10 reached' : 'Set as popular'}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                      isPopular
                                        ? 'bg-orange-100 text-orange-500 hover:bg-red-100 hover:text-red-500'
                                        : popularIds.length >= 10
                                          ? 'text-slate-300 cursor-not-allowed'
                                          : 'text-slate-300 hover:text-orange-400'
                                    }`}
                                  >
                                    <i className={`fa-${isPopular ? 'solid' : 'regular'} fa-fire text-sm`}></i>
                                  </button>
                                );
                              })()}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEdit(book)}
                                  className="w-8 h-8 rounded bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center transition-colors"
                                  title="Edit Book"
                                >
                                  <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button 
                                  onClick={() => handleDelete(book.id)}
                                  className="w-8 h-8 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors"
                                  title="Delete Book"
                                >
                                  <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
