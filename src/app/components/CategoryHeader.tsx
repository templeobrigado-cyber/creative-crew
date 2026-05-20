import { LucideIcon } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';

interface CategoryHeaderProps {
  icon: LucideIcon;
  name: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

export function CategoryHeader({ icon: Icon, name, breadcrumbs }: CategoryHeaderProps) {
  return (
    <div className="bg-white border-b-2 border-gray-200 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 flex items-center gap-5">
          <div className="w-20 h-20 flex items-center justify-center rounded-lg bg-amber-50 border-2 border-amber-200">
            <Icon className="w-12 h-12 text-amber-600" strokeWidth={1.8} />
          </div>
          <h1 className="text-3xl">{name}</h1>
        </div>
      </div>
    </div>
  );
}
