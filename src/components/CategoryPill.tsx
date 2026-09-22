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
      className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-semibold transition-all duration-200 snap-start border ${
        isActive
          ? "bg-brand-500 border-brand-500 text-white shadow-sm"
          : "bg-transparent border-surface-400 text-surface-600 hover:border-surface-600 hover:text-surface-900"
      }`}
    >
      {category}
    </button>
  );
}
