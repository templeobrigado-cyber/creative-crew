interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-gray-700 font-medium' : 'text-amber-600'}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-gray-400 font-light">›</span>}
          </div>
        );
      })}
    </nav>
  );
}
