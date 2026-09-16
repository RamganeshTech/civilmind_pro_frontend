// pages/LabourCategoryBackupMain.tsx
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, RefreshCw, Trash2, MoreVertical } from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { Dropdown, type DropdownItem } from '../../../../components/ui/Dropdown';
import { toast } from '../../../../components/ui/toast/Toast';
import { useGetInactiveLabourCategories, useHardDeleteLabourCategory, useRecoverLabourCategory } from '../../../../api_service/labour_api/labourCategoryApi';

// import { 
//     useGetInactiveLabourCategories, 
//     useRecoverLabourCategory, 
//     useHardDeleteLabourCategory 
// } from '../hooks/useLabourCategory';
// import { Input } from '../components/ui/Input';

// Ensure this matches your shared type definition
export interface LabourCategory {
    _id: string;
    categoryName: string;
    description?: string;
    code?: string;
    color?: string;
    isActive?: boolean;
}

// --- Internal Card Component specifically for Backups ---
interface BackupCategoryCardProps {
    category: LabourCategory;
    onRecover: (id: string, name: string) => void;
    onHardDelete: (id: string, name: string) => void;
}

const BackupCategoryCard = memo(({ category, onRecover, onHardDelete }: BackupCategoryCardProps) => {
    const tagCode = (category.code || category.categoryName.slice(0, 3)).toUpperCase();

    const menuItems: DropdownItem[] = [
        {
            label: 'Recover',
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            onClick: () => onRecover(category._id, category.categoryName),
            isDanger: false,
        },
        {
            label: 'Delete Permanently',
            icon: <Trash2 className="w-3.5 h-3.5" />,
            onClick: () => onHardDelete(category._id, category.categoryName),
            isDanger: true,
        },
    ];

    return (
        <Card className="relative p-3.5 bg-surface border border-border rounded-xl transition-all duration-150 hover:border-danger/40 hover:shadow-sm flex flex-col justify-between min-h-[120px] opacity-80 hover:opacity-100">
            {/* Grayed out structural line to indicate inactive state */}
            <span
                className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-muted"
                aria-hidden="true"
            />

            <div className="pl-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 max-w-[70px] truncate h-5 px-1.5 flex items-center justify-center font-mono text-[10px] font-semibold tracking-wider text-muted bg-surface-hover border border-border rounded">
                        {tagCode}
                    </span>
                    <h3
                        className="text-sm font-semibold text-muted line-through truncate"
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

            <div className="pt-2 pl-2 border-t border-border/60 flex items-center justify-between">
                {/* <span className="text-[10px] font-medium text-danger flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Deleted
                </span> */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRecover(category._id, category.categoryName)}
                    className="h-7 px-2 text-xs font-medium text-success hover:bg-success/10"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                    Restore
                </Button>
            </div>
        </Card>
    );
});
BackupCategoryCard.displayName = 'BackupCategoryCard';

// --- Main Backup Page Component ---
export const LabourCategoryBackupMain: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: inactiveCategories = [], isLoading } = useGetInactiveLabourCategories();
    const { mutateAsync: recoverCategory } = useRecoverLabourCategory();
    const { mutateAsync: hardDeleteCategory } = useHardDeleteLabourCategory();

    // Client-side search optimization
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return inactiveCategories;
        const lowerSearch = searchTerm.toLowerCase();
        return inactiveCategories.filter((cat: LabourCategory) =>
            cat.categoryName.toLowerCase().includes(lowerSearch) ||
            (cat.description && cat.description.toLowerCase().includes(lowerSearch))
        );
    }, [inactiveCategories, searchTerm]);

    const handleRecover = useCallback(async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to recover "${name}"?`)) {
            try {
                await recoverCategory(id);
                toast.success(`"${name}" has been restored successfully.`);
            } catch (error: any) {
                toast.error(error.message || 'Failed to recover category.');
            }
        }
    }, [recoverCategory]);

    const handleHardDelete = useCallback(async (id: string, name: string) => {
        if (window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete "${name}"? This action cannot be undone.`)) {
            try {
                await hardDeleteCategory(id);
                toast.success(`"${name}" was permanently deleted.`);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete category permanently.');
            }
        }
    }, [hardDeleteCategory]);

    return (
        <div className="flex flex-col h-full bg-page text-body">
            {/* Header Area */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 p-0 text-muted hover:text-heading"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-heading">Deleted Labour Categories</h1>
                        <p className="text-sm text-muted mt-1">Recover or permanently delete removed categories.</p>
                    </div>
                </div>

                <div className="flex items-center w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            placeholder="Search backups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full h-9 text-sm"
                        />
                    </div>
                </div>
            </header>

            {/* Main Grid View */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-muted font-medium">
                        Loading backups...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <ArchiveEmptyStateIcon className="w-12 h-12 text-border mb-3" />
                        <p className="text-heading font-medium">No deleted categories found</p>
                        <p className="text-sm text-muted mt-1">The backup archive is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredCategories.map((category: LabourCategory) => (
                            <BackupCategoryCard
                                key={category._id}
                                category={category}
                                onRecover={handleRecover}
                                onHardDelete={handleHardDelete}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// Simple empty state SVG for visual polish
const ArchiveEmptyStateIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);