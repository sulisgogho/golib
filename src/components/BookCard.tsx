import { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onClick: () => void;
  size?: "normal" | "large";
  percentage?: number;
  subtitle?: React.ReactNode;
  titleLines?: 1 | 2;
}

export default function BookCard({ book, onClick, size = "normal", percentage, subtitle, titleLines = 2 }: BookCardProps) {
  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "27272a"}/${book.textColor || "fafafa"
    }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  const widthClass = size === "large" ? "w-40 sm:w-56" : "w-32 sm:w-40";

  return (
    <div
      className={`${widthClass} flex-shrink-0 cursor-pointer snap-start group relative z-0 hover:z-50`}
      onClick={onClick}
    >
      <div className={`relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-6 transition-all duration-500 bg-surface-300 group-hover:-translate-y-4 group-hover:scale-110 ${size === "large" ? "shadow-[10px_15px_30px_rgba(0,0,0,0.4)] group-hover:shadow-[20px_40px_70px_rgba(0,0,0,0.65)]" : "shadow-[5px_5px_15px_rgba(0,0,0,0.15)] group-hover:shadow-[15px_25px_50px_rgba(0,0,0,0.4)]"}`}>
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {/* Realistic Book Spine Shadow */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent w-[8%] mix-blend-multiply pointer-events-none"></div>
        {/* Subtle Inner Highlight */}
        <div className="absolute inset-0 shadow-[inset_1px_0_1px_rgba(255,255,255,0.3),inset_-1px_0_1px_rgba(0,0,0,0.1)] pointer-events-none"></div>
      </div>
      <h4 className={`font-bold text-surface-900 ${titleLines === 1 ? 'line-clamp-1' : 'line-clamp-2'} leading-snug group-hover:text-brand-600 transition-colors duration-200 ${size === "large" ? "text-lg" : "text-base"}`}>
        {book.title}
      </h4>
      <p className="text-sm text-surface-600 mt-1 truncate italic">
        {subtitle !== undefined ? subtitle : book.author}
      </p>
      {percentage !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-surface-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="text-right text-[10px] text-surface-500 mt-1">{percentage}% completed</div>
        </div>
      )}
    </div>
  );
}


