    // components/labours/LabourCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { SideModal } from '../../../components/ui/SideModal';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Button } from '../../../components/ui/Button';
import type { LabourCategory } from './LabourCategoryCard';
import { useCreateLabourCategory, useUpdateLabourCategory } from '../../../api_service/labour_api/labourCategoryApi';

interface LabourCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: LabourCategory | null;
}

export const LabourCategoryModal: React.FC<LabourCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  category 
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateLabourCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateLabourCategory();
  
  const isPending = isCreating || isUpdating;
  const isEditMode = !!category;

  // Hydrate or reset the form whenever the modal opens or the category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setCategoryName(category.categoryName || '');
        setDescription(category.description || '');
      } else {
        setCategoryName('');
        setDescription('');
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (isEditMode) {
        await updateCategory({
          categoryId: category._id,
          payload: { categoryName, description }
        });
      } else {
        await createCategory({ categoryName, description });
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} category`, error);
    }
  };

  return (
    <SideModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditMode ? "Edit Labour Category" : "Create Labour Category"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Category Name <span className="text-danger">*</span></Label>
            <Input
              id="category-name"
              placeholder="e.g., Skilled Masonry, Electricians..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              placeholder="Brief description of the labour type..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isPending || !categoryName.trim()}>
            {isPending 
              ? (isEditMode ? 'Saving...' : 'Creating...') 
              : (isEditMode ? 'Save Changes' : 'Create Category')}
          </Button>
        </div>
      </form>
    </SideModal>
  );
};