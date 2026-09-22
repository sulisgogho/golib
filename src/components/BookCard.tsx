import { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onClick: () => void;
  size?: "normal" | "large";
}

export default function BookCard({ book, onClick, size = "normal" }: BookCardProps) {
  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "27272a"}/${book.textColor || "fafafa"
    }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  const widthClass = size === "large" ? "w-40 sm:w-56" : "w-32 sm:w-40";

  return (
    <div
      className={`${widthClass} flex-shrink-0 cursor-pointer snap-start group relative z-0 hover:z-10`}
      onClick={onClick}
    >
      <div className="relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-4 shadow-[5px_5px_15px_rgba(0,0,0,0.15)] group-hover:shadow-[15px_25px_50px_rgba(0,0,0,0.4)] transition-all duration-500 bg-surface-300 group-hover:-translate-y-4 group-hover:scale-125">
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
      <h4 className="font-medium text-surface-900 text-sm line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors duration-200">
        {book.title}
      </h4>
      <p className="text-xs text-surface-600 mt-1 truncate italic">
        {book.author}
      </p>
    </div>
  );
}


