import { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onClick: () => void;
  size?: "normal" | "medium" | "large";
  progress?: number;
  isActive?: boolean;
}

export default function BookCard({ book, onClick, size = "normal", progress, isActive }: BookCardProps) {
  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "27272a"}/${
    book.textColor || "fafafa"
  }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  const widthClass = size === "large" ? "w-40 sm:w-56" : size === "medium" ? "w-36 sm:w-48" : "w-32 sm:w-40";
  
  // Combine hover classes with active classes so isActive perfectly mimics hover state
  const coverActiveClasses = isActive 
    ? "shadow-[15px_25px_40px_rgba(0,0,0,0.45),_0px_5px_10px_rgba(0,0,0,0.3)] -translate-y-2 scale-110" 
    : "shadow-[8px_8px_20px_rgba(0,0,0,0.35),_0px_2px_5px_rgba(0,0,0,0.2)]";
    
  const titleActiveClasses = isActive
    ? "text-brand-600"
    : "text-surface-900 group-hover:text-brand-600";

  return (
    <div
      className={`${widthClass} flex-shrink-0 cursor-pointer snap-start group relative z-0 hover:z-10`}
      onClick={onClick}
    >
      <div className={`relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-6 transition-all duration-500 bg-surface-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-[15px_25px_40px_rgba(0,0,0,0.45),_0px_5px_10px_rgba(0,0,0,0.3)] ${coverActiveClasses}`}>
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
      <div className="px-1">
        <h4 className={`font-bold text-base truncate leading-snug transition-colors duration-200 ${titleActiveClasses}`}>
          {book.title}
        </h4>
        <p className="text-sm text-surface-600 mt-1 truncate italic">
          {book.author}
        </p>
        
        {progress !== undefined && (
          <div className="mt-3 flex items-center gap-2">
             <div className="h-1.5 flex-1 bg-surface-300 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{width: `${progress}%`}}></div>
             </div>
             <span className="text-[10px] font-bold text-brand-600">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}


