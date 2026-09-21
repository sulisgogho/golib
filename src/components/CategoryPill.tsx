interface CategoryPillProps {
  category: string;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryPill({
  category,
  isActive,
  onClick,
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm snap-start ${
        isActive
          ? "bg-emerald-500 text-white shadow-[0_8px_15px_-5px_rgba(16,185,129,0.5)]"
          : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
      }`}
    >
      {category}
    </button>
  );
}
