// pages/LabourCategoryMain.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Plus, Archive, HardHat } from 'lucide-react';
import { LabourCategoryCard, type LabourCategory } from './LabourCategoryCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { LabourCategoryModal } from './LabourCategoryModal';
import { useDeleteLabourCategory, useGetAllLabourCategories } from '../../../api_service/labour_api/labourCategoryApi';

const LabourCategoryMain: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<LabourCategory | null>(null);

    const { data: categories = [], isLoading } = useGetAllLabourCategories();
    const { mutateAsync: deleteCategory } = useDeleteLabourCategory();

    // Client-side search filtering
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return categories;
        const lowerSearch = searchTerm.toLowerCase();
        return categories.filter((cat: LabourCategory) =>
            cat.categoryName.toLowerCase().includes(lowerSearch) ||
            (cat.description && cat.description.toLowerCase().includes(lowerSearch))
        );
    }, [categories, searchTerm]);

    const handleEdit = useCallback((category: LabourCategory) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this labour category?')) {
            try {
                await deleteCategory(id);
            } catch (error) {
                console.error('Failed to delete', error);
            }
        }
    }, [deleteCategory]);

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingCategory(null), 300); // Wait for slide animation to finish
    };

    const handleView = useCallback((id: string) => {
        navigate(`single/${id}`); // Adjust this route based on your router config
    }, [navigate]);



    const handleBackupNavigate = () => {
        navigate("/layout/labour-configuration-backup")
    }



    const isChild = location.pathname.includes("single")

    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="flex flex-col h-full bg-page text-body">
            {/* Header Area */}
            {/* <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm"> */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-surface border-b border-border shadow-xs">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2.5">
                        <HardHat strokeWidth={2.6} className="w-5 h-5 text-primary shrink-0" />
                        <h1 className="text-lg sm:text-xl font-bold text-heading leading-tight">
                            Labour Categories
                        </h1>
                    </div>
                    <p className="text-xs text-muted font-medium mt-0.5">
                        Manage categories for labour items and workforce rates.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full h-9 text-sm"
                        />
                    </div>


                    <Button
                        variant="secondary"
                        className="shrink-0 inline-flex flex-row items-center justify-center whitespace-nowrap gap-1.5 px-3.5 py-2 text-sm font-medium"
                        leftIcon={<Archive className="w-4 h-4" />}
                        onClick={handleBackupNavigate}
                    >
                        Archive
                    </Button>

                    <Button
                        variant="primary"
                        className="shrink-0 inline-flex flex-row items-center justify-center whitespace-nowrap gap-1.5 h-9 px-3.5 text-sm font-medium"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={handleOpenCreate}
                    >
                        New Category
                    </Button>
                </div>
            </header>

            {/* Main Grid View */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-muted font-medium">
                        Loading labour categories...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <p className="text-heading font-medium">No categories found</p>
                        <p className="text-sm text-muted">Try adjusting your search or add a new category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCategories.map((category: LabourCategory) => (
                            <LabourCategoryCard
                                key={category._id}
                                category={category}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Replaces the two separate modals */}
            <LabourCategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                category={editingCategory}
            />
        </div>
    );
};


export default LabourCategoryMain;