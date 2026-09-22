import { Book } from "@/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

interface OverviewModalProps {
  book: Book | null;
  onClose: () => void;
  onRead: () => void;
}

export default function OverviewModal({
  book,
  onClose,
  onRead,
}: OverviewModalProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (book) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [book]);

  useEffect(() => {
    if (!user || !book) {
      setIsSaved(false);
      return;
    }
    const docRef = doc(db, `users/${user.uid}/savedBooks`, book.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setIsSaved(docSnap.exists());
    });
    return () => unsubscribe();
  }, [user, book]);

  const handleToggleSave = async () => {
    if (!user || !book || isSaving) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, `users/${user.uid}/savedBooks`, book.id);
      if (isSaved) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { savedAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!book) return null;

  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "27272a"}/${
    book.textColor || "fafafa"
  }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 transition-all">
      <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col sm:flex-row overflow-hidden modal-animate relative max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Left Cover */}
        <div className="w-full sm:w-2/5 bg-surface-900 dark:bg-black p-8 sm:p-10 flex justify-center items-center relative overflow-hidden shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-150"
            style={{ backgroundImage: `url(${coverUrl})` }}
          ></div>
          <img
            src={coverUrl}
            className="w-full max-w-[140px] sm:max-w-[200px] object-cover rounded-xl shadow-2xl relative z-10"
            alt="Cover"
          />
        </div>

        {/* Right Content */}
        <div className="w-full sm:w-3/5 p-8 sm:p-10 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold uppercase tracking-widest rounded-full bg-brand-100 text-brand-700">
              {book.category}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-surface-950 mb-2 leading-tight">
              {book.title}
            </h3>
            <p className="text-sm text-surface-600 font-medium italic">
              By {book.author}
            </p>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="border border-surface-200 rounded-xl p-4 text-center flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">Pages</p>
              <p className="font-semibold text-base text-surface-900">{book.pages}</p>
            </div>
            <div className="border border-surface-200 rounded-xl p-4 text-center flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">Language</p>
              <p className="font-semibold text-base text-surface-900">{book.language}</p>
            </div>
          </div>

          <div className="flex-1 mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-4">Synopsis</h4>
            <p className="text-surface-700 text-sm leading-relaxed text-justify hyphens-auto">
              {book.desc}
            </p>
          </div>

          <div className="flex gap-4 mt-auto">
            <button
              id={`save-btn-${book.id}`}
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`w-12 h-12 flex-shrink-0 border rounded-full flex justify-center items-center transition-all text-base ${
                isSaved 
                  ? "border-brand-500 text-brand-500 bg-brand-50" 
                  : "border-surface-300 hover:border-brand-500 hover:text-brand-600 text-surface-600"
              }`}
              title={isSaved ? "Remove from Library" : "Save to Library"}
            >
              <i className={isSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}></i>
            </button>
            <button
              onClick={onRead}
              className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-full transition-all flex justify-center items-center gap-2 text-sm shadow-md"
            >
              <span>Read Now</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
