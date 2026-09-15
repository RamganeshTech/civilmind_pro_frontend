// components/materials/MaterialCategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { useCreateMaterialCategory, useUpdateMaterialCategory, type MaterialCategory } from '../../../api_service/material_api/materialCategoryApi';
import { SideModal } from '../../../components/ui/SideModal';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { toast } from '../../../components/ui/toast/Toast';

interface MaterialCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: MaterialCategory | null;
}

export const MaterialCategoryModal: React.FC<MaterialCategoryModalProps> = ({
  isOpen,
  onClose,
  category
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');

  const { mutateAsync: createCategory, isPending: isCreating } = useCreateMaterialCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateMaterialCategory();

  const isPending = isCreating || isUpdating;
  const isEditMode = !!category;

  // Hydrate or reset the form whenever the modal opens or the category changes
 
  // Hydrate or reset the form
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setCategoryName(category.categoryName || '');
        setCode(category.code || '');
        setDescription(category.description || '');
        setColor(category.color || '');
      } else {
        setCategoryName('');
        setCode('');
        setDescription('');
        setColor('');
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    // Create a payload matching the backend ALLOWED_FIELDS
    const payload = { categoryName, code, description, color };

    try {
      if (isEditMode) {
        await updateCategory({
          categoryId: category._id,
          payload // Sends { categoryName, code, description, color }
        });
        toast.success('Material updated successfully.');
      } else {
        await createCategory(payload);
        toast.success('Material created successfully.');
      }
      onClose();
    } catch (error:any) {
      toast.error(error?.message || 'something went wrong.');
    }
  };


  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Material Category" : "Create Material Category"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
       <div className="flex-1 space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="category-name">Category Name <span className="text-danger">*</span></Label>
            <Input
              id="category-name"
              placeholder="e.g., Plywood, Hardware..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="category-code">Category Code</Label>
            <Input
              id="category-code"
              placeholder="e.g., PLY, HDW..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              placeholder="Brief description of materials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Update your submit button disabled check */}
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