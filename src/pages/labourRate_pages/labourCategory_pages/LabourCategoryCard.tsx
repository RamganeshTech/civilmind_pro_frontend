// components/labours/LabourCategoryCard.tsx
import { memo } from 'react';
import { Edit2, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { Dropdown, type DropdownItem } from '../../../components/ui/Dropdown';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
// Assuming this type is in your api.types.ts
export interface LabourCategory {
  _id: string;
  categoryName: string;
  description?: string;
  code?: string;
  color?: string;
  isActive?: boolean;
}

interface LabourCategoryCardProps {
  category: LabourCategory;
  onEdit: (category: LabourCategory) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const LabourCategoryCard = memo(({ category, onEdit, onDelete, onView }: LabourCategoryCardProps) => {
  const tagCode = (category.code || category.categoryName.slice(0, 3)).toUpperCase();

  const menuItems: DropdownItem[] = [
    {
      label: 'Edit',
      icon: <Edit2 className="w-3.5 h-3.5" />,
      onClick: () => onEdit(category),
      isDanger: false,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      onClick: () => onDelete(category._id),
      isDanger: true,
    },
  ];

  return (
    <Card className="relative p-3.5 bg-surface border border-border rounded-xl transition-all duration-150 hover:border-primary/40 hover:shadow-sm flex flex-col justify-between min-h-[120px]">
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
        style={{ backgroundColor: category.color || 'var(--color-primary)' }}
        aria-hidden="true"
      />

      <div className="pl-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="shrink-0 max-w-[70px] truncate h-5 px-1.5 flex items-center justify-center font-mono text-[10px] font-semibold tracking-wider text-primary bg-surface-hover border border-border rounded">
            {tagCode}
          </span>
          <h3
            className="text-sm font-semibold text-heading truncate"
            title={category.categoryName}
          >
            {category.categoryName}
          </h3>
        </div>

        <Dropdown
          align="right"
          triggerLabel={`Options for ${category.categoryName}`}
          trigger={
            <span className="h-6 w-6 inline-flex items-center justify-center text-muted hover:text-heading hover:bg-surface-hover rounded transition-colors">
              <MoreVertical className="w-3.5 h-3.5" />
            </span>
          }
        //   menuWidth={130}
          items={menuItems}
        />
      </div>

      <div className="pl-2 mt-1.5 mb-2.5 flex-1">
        <p
          className="text-xs text-muted line-clamp-2 leading-relaxed"
          title={category.description || ''}
        >
          {category.description || 'No description provided.'}
        </p>
      </div>

      <div className="pt-2 pl-2 border-t border-border/60 flex items-center justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(category._id)}
          className="h-7 px-3 text-xs font-medium"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View
        </Button>
      </div>
    </Card>
  );
});

LabourCategoryCard.displayName = 'LabourCategoryCard';