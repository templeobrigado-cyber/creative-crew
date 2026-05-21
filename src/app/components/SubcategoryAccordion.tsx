import { ChevronDown, ChevronUp } from 'lucide-react';

interface Article {
  title: string;
  href: string;
}

interface SubcategoryAccordionProps {
  title: string;
  articles: Article[];
  isOpen: boolean;
  onToggle: () => void;
}

export function SubcategoryAccordion({ title, articles, isOpen, onToggle }: SubcategoryAccordionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full h-16 px-6 flex items-center justify-between hover:bg-amber-50/30 transition-all group"
      >
        <span className="text-base font-medium text-gray-900 group-hover:text-amber-700 transition-colors">{title}</span>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-700 group-hover:text-amber-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-700 group-hover:text-amber-700" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 bg-amber-50/20">
          <ul className="space-y-3">
            {articles.map((article, index) => (
              <li key={index}>
                <a
                  href={article.href}
                  className="block py-2 px-3 text-amber-700 hover:text-amber-800 hover:bg-white rounded transition-all"
                >
                  → {article.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
