// pages/RateConfigurationItemsMain.tsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    ArrowLeft, Search, Plus, Check, X, Edit2, Trash2, TrendingUp, TrendingDown, Minus,
    Loader2,
    Archive
} from 'lucide-react';
// import { 
//   useGetAllMaterialItems, useCreateMaterialItem, useUpdateMaterialItem, useDeleteMaterialItem 
// } from '../../../api_service/material_api/materialItemApi';
import { useGetSingleMaterialCategory } from '../../../api_service/material_api/materialCategoryApi';
// import { 
//   MaterialItem, IMaterialUnit, IMaterialItemStatus, CreateItemInput 
// } from '../../../types/materialItem.types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { toast } from '../../../components/ui/toast/Toast';
import {
    useGetAllMaterialItems, useCreateMaterialItem, useUpdateMaterialItem, useDeleteMaterialItem,
    type MaterialItem, type IMaterialUnit, type IMaterialItemStatus, type CreateItemInput,
    type UpdateItemInput
} from '../../../api_service/material_api/materialItemApi';

const UNITS: IMaterialUnit[] = [
    "Bag", "Kg", "Ton", "Cft", "Cum", "Sqft", "Sqm",
    "Rft", "Nos", "Litre", "Load", "Bundle", "Roll", "Box"
];

const STATUSES: IMaterialItemStatus[] = ["Active", "Inactive", "Discontinued"];

export const RateConfigurationItemsMain: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const location = useLocation()


    const [searchTerm, setSearchTerm] = useState('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    //   const [editRowData, setEditRowData] = useState<Partial<MaterialItem>>({});
    const [editRowData, setEditRowData] = useState<UpdateItemInput>({});

    // Form state for direct inline row creation
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItem, setNewItem] = useState<CreateItemInput>({
        categoryId: categoryId || '',
        productName: '',
        brand: '',
        unit: 'Nos',
        currentRate: 0,
        status: 'Active',
        source: '',
        notes: '',
    });

    // Queries & Mutations
    const { data: categoryData } = useGetSingleMaterialCategory(categoryId);
    const { data: itemsData, isLoading } = useGetAllMaterialItems({
        categoryId,
        // limit: 100 
    });

    const { mutateAsync: createItem, isPending: isCreating } = useCreateMaterialItem();
    const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateMaterialItem();
    const { mutateAsync: deleteItem } = useDeleteMaterialItem();

    const category = categoryData?.category || categoryData;
    const items = itemsData?.items || [];

    // Filter items based on product name or brand
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(
            (item) =>
                item.productName.toLowerCase().includes(term) ||
                item.brand?.toLowerCase().includes(term) ||
                item.source?.toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    // Start row inline edit
    const handleStartEdit = (item: MaterialItem) => {
        setIsAddingNew(false);
        setEditingItemId(item._id);
        setEditRowData({
            productName: item.productName,
            brand: item.brand || '',
            unit: item.unit,
            currentRate: item.currentRate,
            status: item.status,
            source: item.source || '',
            notes: item.notes || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditRowData({});
    };

    // Submit row inline edit
    const handleSaveEdit = async (itemId: string) => {
        if (!editRowData.productName?.trim()) {
            toast.error('Product name is required');
            return;
        }


        if (editRowData.currentRate === undefined || editRowData.currentRate < 0) {
            toast.error('Valid rate is required');
            return;
        }

        try {
            await updateItem({
                itemId,
                payload: editRowData,
            });
            toast.success('Material updated');
            handleCancelEdit();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update item');
        }
    };

    // Submit inline creation
    const handleCreateSubmit = async () => {
        if (!categoryId) return;
        if (!newItem.productName.trim()) {
            toast.error('Product name is required');
            return;
        }

        if (newItem.currentRate < 0) {
            toast.error('Rate cannot be negative');
            return;
        }

        try {
            await createItem({ ...newItem, categoryId });
            toast.success('Material added');
            setNewItem({
                categoryId,
                productName: '',
                brand: '',
                unit: 'Nos',
                currentRate: 0,
                status: 'Active',
                source: '',
                notes: '',
            });
            setIsAddingNew(false);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create item');
        }
    };

    const handleDeleteItem = async (itemId: string, name: string) => {
        if (!window.confirm(`Are you sure you want to remove "${name}"?`)) return;
        try {
            await deleteItem(itemId);
            toast.success('Material removed');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        }
    };



    const isChild = location.pathname.includes("backup")

    if (isChild) {
        return <Outlet />
    }



    return (
        <div className="flex flex-col h-full bg-page text-body">
            {/* Header bar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 p-0 text-muted hover:text-heading"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border text-primary">
                                {category?.code || 'CAT'}
                            </span>
                            <h1 className="text-xl font-bold text-heading">
                                {category?.categoryName || 'Material Items'}
                            </h1>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                            Manage items, rates, and unit specifications.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            placeholder="Search items, brands..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full text-xs h-9"
                        />
                    </div>

                    <Button
                        variant="primary"
                        leftIcon={<Plus className="w-4 h-4 shrink-0" />}
                        onClick={() => {
                            handleCancelEdit();
                            setIsAddingNew(true);
                        }}
                        disabled={isAddingNew}
                        className="text-xs h-9 px-3 shrink-0"
                    >
                        Add Material
                    </Button>

                    <Button
                        variant="secondary"
                        leftIcon={<Archive className="w-4 h-4 shrink-0" />}
                        onClick={() => {
                            navigate('backup')
                        }}
                        className="text-xs h-9 px-3 shrink-0"
                    >
                        Backup
                    </Button>

                </div>
            </header>

            {/* Main Grid/Table View */}
            <main className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="border border-border rounded-xl bg-surface shadow-sm overflow-hidden min-w-[850px]">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-surface-hover/80 text-heading font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Product Name</th>
                                <th className="py-3 px-3 w-36">Brand</th>
                                <th className="py-3 px-3 w-28">Unit</th>
                                <th className="py-3 px-3 w-32">Rate (₹)</th>
                                <th className="py-3 px-3 w-28">Trend</th>
                                <th className="py-3 px-3 w-32">Status</th>
                                <th className="py-3 px-3 w-36">Source</th>
                                <th className="py-3 px-4 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                            {/* Top Inline Creation Row */}
                            {isAddingNew && (
                                <tr className="bg-primary/5 border-b-2 border-primary">
                                    <td className="p-2 pl-3">
                                        <Input
                                            autoFocus
                                            placeholder="e.g., UltraTech OPC 53"
                                            value={newItem.productName}
                                            onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                                            className="h-8 text-xs font-medium bg-surface text-heading"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            placeholder="Brand"
                                            value={newItem.brand}
                                            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                                            className="h-8 text-xs font-medium bg-surface text-heading"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as IMaterialUnit })}
                                            className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                        >
                                            {UNITS.map((u) => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={newItem.currentRate || ''}
                                            onChange={(e) => setNewItem({ ...newItem, currentRate: parseFloat(e.target.value) || 0 })}
                                            className="h-8 text-xs font-semibold text-primary bg-surface"
                                        />
                                    </td>
                                    <td className="p-2 text-muted font-medium text-[11px]">—</td>
                                    <td className="p-2">
                                        <select
                                            value={newItem.status}
                                            onChange={(e) => setNewItem({ ...newItem, status: e.target.value as IMaterialItemStatus })}
                                            className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            placeholder="Quotation / Vendor"
                                            value={newItem.source}
                                            onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                                            className="h-8 text-xs font-medium bg-surface text-heading"
                                        />
                                    </td>
                                    <td className="p-2 pr-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCreateSubmit}
                                                disabled={isCreating}
                                                className="h-7 w-7 p-0 text-success hover:bg-success/10"
                                            >
                                                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsAddingNew(false)}
                                                className="h-7 w-7 p-0 text-danger hover:bg-danger/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Data Loading State */}
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-muted font-medium">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                                        Loading materials...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 && !isAddingNew ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-muted font-medium">
                                        No material items configured under this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isEditing = editingItemId === item._id;

                                    if (isEditing) {
                                        return (
                                            <tr key={item._id} className="bg-surface-hover/50 border-y border-primary/20">
                                                <td className="p-2 pl-3">
                                                    <Input
                                                        autoFocus
                                                        value={editRowData.productName || ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, productName: e.target.value })}
                                                        className="h-8 text-xs font-medium bg-surface text-heading"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={editRowData.brand || ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, brand: e.target.value })}
                                                        className="h-8 text-xs font-medium bg-surface text-heading"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <select
                                                        value={editRowData.unit || item.unit}
                                                        onChange={(e) => setEditRowData({ ...editRowData, unit: e.target.value as IMaterialUnit })}
                                                        className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                                    >
                                                        {UNITS.map((u) => (
                                                            <option key={u} value={u}>{u}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={editRowData.currentRate ?? ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, currentRate: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs font-semibold text-primary bg-surface"
                                                    />
                                                </td>
                                                <td className="p-2 text-muted font-medium text-[11px]">—</td>
                                                <td className="p-2">
                                                    <select
                                                        value={editRowData.status || item.status}
                                                        onChange={(e) => setEditRowData({ ...editRowData, status: e.target.value as IMaterialItemStatus })}
                                                        className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={editRowData.source || ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, source: e.target.value })}
                                                        className="h-8 text-xs font-medium bg-surface text-heading"
                                                    />
                                                </td>
                                                <td className="p-2 pr-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(item._id)}
                                                            disabled={isUpdating}
                                                            className="h-7 w-7 p-0 text-success hover:bg-success/10"
                                                        >
                                                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                            className="h-7 w-7 p-0 text-muted hover:bg-surface-hover"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={item._id} className="hover:bg-surface-hover/50 transition-colors group">
                                            <td className="py-3 px-4 font-semibold text-heading text-sm">
                                                {item.productName}
                                            </td>
                                            <td className="py-3 px-3 text-body font-medium">
                                                {item.brand || '—'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 font-mono text-[11px] font-semibold rounded bg-page border border-border text-heading shadow-sm">
                                                    {item.unit}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-primary text-sm tracking-wide">
                                                ₹{item.currentRate.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3">
                                                {item.rateChangeDirection === 'increase' && (
                                                    <span className="inline-flex items-center gap-0.5 text-danger font-semibold text-[11px]">
                                                        <TrendingUp className="w-3.5 h-3.5" />
                                                        {item.rateChangePercentage}%
                                                    </span>
                                                )}
                                                {item.rateChangeDirection === 'decrease' && (
                                                    <span className="inline-flex items-center gap-0.5 text-success font-semibold text-[11px]">
                                                        <TrendingDown className="w-3.5 h-3.5" />
                                                        {Math.abs(item.rateChangePercentage)}%
                                                    </span>
                                                )}
                                                {item.rateChangeDirection === 'no_change' && (
                                                    <span className="inline-flex items-center gap-0.5 text-muted font-medium text-[11px]">
                                                        <Minus className="w-3.5 h-3.5" /> 0%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span
                                                    className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md ${item.status === 'Active'
                                                            ? 'bg-success/15 text-success'
                                                            : item.status === 'Discontinued'
                                                                ? 'bg-danger/10 text-danger'
                                                                : 'bg-muted/15 text-body'
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-body font-medium truncate max-w-[140px]">
                                                {item.source || '—'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStartEdit(item)}
                                                        className="h-7 w-7 p-0 text-muted hover:text-primary hover:bg-surface-hover"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteItem(item._id, item.productName)}
                                                        className="h-7 w-7 p-0 text-muted hover:text-danger hover:bg-danger/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};