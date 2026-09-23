import { Book } from "@/types";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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
  const { user, userData, canRead, trialDaysLeft } = useAuth();
  const router = useRouter();

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

  if (!book) return null;

  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "e2e8f0"}/${
    book.textColor || "1e293b"
  }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 dark:bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-4 transition-all">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 flex flex-col md:flex-row overflow-hidden modal-animate relative border border-slate-100 dark:border-slate-700 max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-red-100 hover:text-red-500 transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Left Side Cover */}
        <div className="w-full md:w-2/5 bg-slate-50 dark:bg-slate-900 p-8 md:p-12 flex justify-center items-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-2xl transform scale-150"
            style={{ backgroundImage: `url(${coverUrl})` }}
          ></div>
          <img
            src={coverUrl}
            className="w-full max-w-[180px] md:max-w-[260px] object-cover rounded-xl shadow-2xl relative z-10"
            alt="Cover"
          />
        </div>

        {/* Right Side Content */}
        <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col relative z-10 bg-white dark:bg-slate-800 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider rounded-lg bg-orange-100 dark:bg-orange-500/20 text-[#FF6B4A] dark:text-orange-400">
              {book.category}
            </span>
            <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 leading-tight">
              {book.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium md:text-lg">
              <i className="fa-solid fa-pen-nib text-slate-300 dark:text-slate-600 mr-2"></i>
              <span>{book.author}</span>
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center flex-1 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Halaman
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {book.pages}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center flex-1 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Bahasa
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {book.language}
              </p>
            </div>
          </div>

          <div className="flex-1 mb-8">
            <h4 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white mb-2">
              Sinopsis
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify">
              {book.desc}
            </p>
          </div>

          <div className="mt-auto">
            {user && userData && !userData.isApproved && trialDaysLeft > 0 && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl text-sm flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                <i className="fa-solid fa-clock-rotate-left"></i>
                <span>Sisa masa trial Anda: <strong>{trialDaysLeft} hari</strong></span>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const btn = document.getElementById(`save-btn-${book.id}`);
                  if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
                    btn.classList.add("text-brand-500", "bg-brand-50", "dark:bg-brand-500/10");
                    btn.classList.remove("text-slate-500", "dark:text-slate-400");
                  }
                }}
                id={`save-btn-${book.id}`}
                className="w-14 h-[56px] flex-shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl flex justify-center items-center transition-colors text-lg"
                title="Simpan ke Library"
              >
                <i className="fa-regular fa-bookmark"></i>
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    onClose();
                    router.push("/login");
                  } else if (!canRead) {
                    // Do nothing or alert
                    alert("Masa trial habis. Silakan hubungi admin ke email goghotech123@gmail.com");
                  } else {
                    onRead();
                  }
                }}
                className={`flex-1 font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${
                  !user 
                    ? "bg-[#24403B] hover:bg-[#1a2f2b] text-white" 
                    : !canRead 
                      ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed"
                      : "bg-[#24403B] hover:bg-[#1a2f2b] text-white"
                }`}
              >
                <span>
                  {!user 
                    ? "Login untuk Membaca" 
                    : !canRead 
                      ? "Trial Habis - Hubungi Admin" 
                      : "Baca Sekarang"}
                </span>
                <i className={`fa-solid ${!user ? "fa-lock" : !canRead ? "fa-envelope" : "fa-book-open"}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
