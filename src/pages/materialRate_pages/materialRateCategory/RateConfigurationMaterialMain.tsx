// pages/RateMaterialConfigurationMain.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Search, Plus, Layers, Archive } from 'lucide-react';
import { useDeleteMaterialCategory, useGetAllMaterialCategories, type MaterialCategory } from '../../../api_service/material_api/materialCategoryApi';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MaterialCategoryCard } from './MaterialCategoryCard';
import { MaterialCategoryModal } from './MaterialCategoryModal';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const RateConfigurationMaterialMain: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation()
  const navigate = useNavigate()

  // Consolidated Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);

  const { data: response, isLoading } = useGetAllMaterialCategories();
  const { mutateAsync: deleteCategory } = useDeleteMaterialCategory();

  const categories = response?.categories || [];

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const lowerSearch = searchTerm.toLowerCase();
    return categories.filter((cat) =>
      cat.categoryName?.toLowerCase().includes(lowerSearch) ||
      cat.code?.toLowerCase().includes(lowerSearch) ||
      cat.description?.toLowerCase().includes(lowerSearch)
    );
  }, [categories, searchTerm]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };


  const handleBackupNavigate = ()=>{
    navigate("/layout/rate-configuration-backup")
  }

  const handleOpenEdit = useCallback((category: MaterialCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: slight delay before clearing the state prevents form flickering 
    // during the SideModal's closing slide-out animation
    setTimeout(() => setEditingCategory(null), 300);
  };

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Failed to delete', error);
      }
    }
  }, [deleteCategory]);

  const handleNavigate = (id: string) => {
        navigate(`single/${id}`);
  }


  const isChild = location.pathname.includes("single")

  if(isChild){
    return <Outlet />
  }

  return (
    <div className="flex flex-col h-full bg-page text-body">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-heading">Material Categories</h1>
          </div>
          <p className="text-sm text-muted mt-1">Manage categories for estimating and rates.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
           <Button
            variant="secondary"
            // className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-primary-text rounded-lg transition-colors"
            className="shrink-0 inline-flex flex-row items-center justify-center whitespace-nowrap gap-1.5 px-3.5 py-2 text-sm font-medium"
            leftIcon={<Archive className="w-4 h-4" />}
            onClick={handleBackupNavigate}
          >
            <span>Archive</span>
          </Button>

          <Button
            variant="primary"
            // className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-primary-text rounded-lg transition-colors"
            className="shrink-0 inline-flex flex-row items-center justify-center whitespace-nowrap gap-1.5 px-3.5 py-2 text-sm font-medium"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            <span>New Category</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-muted">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-heading font-medium">No categories found</p>
            <p className="text-sm text-muted">Try adjusting your search or add a new category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((category) => (
              <MaterialCategoryCard
                key={category._id}
                category={category}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onView={handleNavigate}
              />
            ))}
          </div>
        )}
      </main>

      <MaterialCategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />
    </div>
  );
};


export default RateConfigurationMaterialMain;