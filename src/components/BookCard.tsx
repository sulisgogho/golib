import { Book } from "@/types";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export default function BookCard({ book, onClick }: BookCardProps) {
  const coverUrl = book.coverUrl || `https://placehold.co/400x600/${book.coverColor || "e2e8f0"}/${
    book.textColor || "1e293b"
  }?text=${encodeURIComponent((book.title || "Untitled").split(" ").join("\n"))}`;

  return (
    <div
      className="w-36 sm:w-48 flex-shrink-0 cursor-pointer snap-start group"
      onClick={onClick}
    >
      <div className="w-full aspect-[2/3] rounded-xl shadow-[0_15px_30px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-200 mb-3">
        <img
          src={coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
        {book.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {book.author}
      </p>
    </div>
  );
}
