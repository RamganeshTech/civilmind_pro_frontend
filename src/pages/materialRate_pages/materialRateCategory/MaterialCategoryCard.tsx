// components/materials/MaterialCategoryCard.tsx
import { memo } from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import type { MaterialCategory } from '../../../api_service/material_api/materialCategoryApi';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface MaterialCategoryCardProps {
  category: MaterialCategory;
  onEdit: (category: MaterialCategory) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const MaterialCategoryCard = memo(({ category, onEdit, onDelete, onView }: MaterialCategoryCardProps) => {
  // Use category code or take the first 2 characters of the category name as a reference marker
  const tagCode = (category.code || category.categoryName.slice(0, 2)).toUpperCase();

  return (
    <Card className="relative p-4 bg-surface border border-border rounded-xl transition-all duration-150 hover:border-primary/50 hover:shadow-sm">
      {/* Structural Accent Line */}
      <span
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r"
        style={{ backgroundColor: category.color || 'var(--color-primary)' }}
        aria-hidden="true"
      />

      {/* Header Area */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Top-Left Spec/Index Badge */}
          <span className="shrink-0 h-7 px-2 flex items-center justify-center font-mono text-xs font-semibold tracking-wider text-primary bg-surface-hover border border-border rounded">
            {tagCode}
          </span>

          {/* Title */}
          <h3 className="text-sm font-semibold text-heading truncate">
            {category.categoryName}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-7 w-7 p-0 text-muted hover:text-primary"
            aria-label={`Edit ${category.categoryName}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category._id)}
            className="h-7 w-7 p-0 text-muted hover:text-danger"
            aria-label={`Delete ${category.categoryName}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(category._id)}
            className="h-7 w-7 p-0 text-muted "
            aria-label={`view ${category.categoryName}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>


        </div>
      </div>

      {/* Description Body */}
      <div className="mt-2.5 pl-2">
        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
          {category.description || 'No description added.'}
        </p>
      </div>
    </Card>
  );
});

MaterialCategoryCard.displayName = 'MaterialCategoryCard';