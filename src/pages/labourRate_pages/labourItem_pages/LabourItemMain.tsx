// pages/LabourItemMain.tsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    ArrowLeft, Search, Plus, Check, X, Edit2, Trash2, TrendingUp, TrendingDown, Minus,
    Loader2,
    Archive
} from 'lucide-react';
import { useGetSingleLabourCategory } from '../../../api_service/labour_api/labourCategoryApi';
import { useCreateLabourItem, useDeleteLabourItem, useGetAllLabourItems, useUpdateLabourItem } from '../../../api_service/labour_api/labourItemsApi';
import { toast } from '../../../components/ui/toast/Toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';


// --- Types matching your schema ---
export type ISkillLevel = "Unskilled" | "Semi-Skilled" | "Skilled" | "Highly Skilled" | "Supervisor";
export type ILabourItemStatus = "Active" | "Inactive" | "Discontinued";
export type IRateChangeDirection = "increase" | "decrease" | "no_change";

export interface LabourItem {
    _id: string;
    categoryId: string;
    refNo: string;
    role: string;
    skillLevel: ISkillLevel;
    rate: number;
    halfDayRate: number;
    otPerHour: number;
    rateChangePercentage: number;
    rateChangeDirection: IRateChangeDirection;
    status: ILabourItemStatus;
    notes?: string;
}

const SKILL_LEVELS: ISkillLevel[] = ["Unskilled", "Semi-Skilled", "Skilled", "Highly Skilled", "Supervisor"];
const STATUSES: ILabourItemStatus[] = ["Active", "Inactive", "Discontinued"];

export const LabourItemMain: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editRowData, setEditRowData] = useState<Partial<LabourItem>>({});

    // Form state for direct inline row creation
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItem, setNewItem] = useState({
        categoryId: categoryId || '',
        role: '',
        skillLevel: 'Skilled' as ISkillLevel,
        rate: 0,
        halfDayRate: 0,
        otPerHour: 0,
        status: 'Active' as ILabourItemStatus,
        notes: '',
    });

    // Queries & Mutations
    const { data: categoryData } = useGetSingleLabourCategory(categoryId);
    const { data: itemsData = [], isLoading } = useGetAllLabourItems({ categoryId });

    const { mutateAsync: createItem, isPending: isCreating } = useCreateLabourItem();
    const { mutateAsync: updateItem, isPending: isUpdating } = useUpdateLabourItem();
    const { mutateAsync: deleteItem } = useDeleteLabourItem();

    const category = categoryData?.category || categoryData;
    const items: LabourItem[] = itemsData?.items || itemsData || [];

    // Filter items based on role or notes
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter((item) =>
            item.role.toLowerCase().includes(term) ||
            item.refNo?.toLowerCase().includes(term) ||
            item.notes?.toLowerCase().includes(term)
        );
    }, [items, searchTerm]);

    // Start row inline edit
    const handleStartEdit = (item: LabourItem) => {
        setIsAddingNew(false);
        setEditingItemId(item._id);
        setEditRowData({
            role: item.role,
            skillLevel: item.skillLevel,
            rate: item.rate,
            halfDayRate: item.halfDayRate,
            otPerHour: item.otPerHour,
            status: item.status,
            notes: item.notes || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditRowData({});
    };

    // Submit row inline edit
    const handleSaveEdit = async (itemId: string) => {
        if (!editRowData.role?.trim()) {
            toast.error('Role name is required');
            return;
        }

        if (
            editRowData.rate === undefined || editRowData.rate < 0 ||
            editRowData.halfDayRate === undefined || editRowData.halfDayRate < 0 ||
            editRowData.otPerHour === undefined || editRowData.otPerHour < 0
        ) {
            toast.error('Valid non-negative rates are required');
            return;
        }

        try {
            await updateItem({
                itemId,
                payload: editRowData,
            });
            toast.success('Labour item updated');
            handleCancelEdit();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update item');
        }
    };

    // Submit inline creation
    const handleCreateSubmit = async () => {
        if (!categoryId) return;
        if (!newItem.role.trim()) {
            toast.error('Role name is required');
            return;
        }

        if (newItem.rate < 0 || newItem.halfDayRate < 0 || newItem.otPerHour < 0) {
            toast.error('Rates cannot be negative');
            return;
        }

        try {
            await createItem({ ...newItem, categoryId });
            toast.success('Labour item added');
            setNewItem({
                categoryId,
                role: '',
                skillLevel: 'Skilled',
                rate: 0,
                halfDayRate: 0,
                otPerHour: 0,
                status: 'Active',
                notes: '',
            });
            setIsAddingNew(false);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create item');
        }
    };

    const handleDeleteItem = async (itemId: string, roleName: string) => {
        if (!window.confirm(`Are you sure you want to remove "${roleName}"?`)) return;
        try {
            await deleteItem(itemId);
            toast.success('Labour item removed');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete');
        }
    };

    // Handle nested backup route
    const isChild = location.pathname.includes("backup");
    if (isChild) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col h-full bg-page text-body">
            {/* Header bar */}
            {/* <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-sm"> */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-surface border-b border-border shadow-xs">
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
                                {category?.code || 'LAB'}
                            </span>
                            <h1 className="text-xl font-bold text-heading">
                                {category?.categoryName || 'Labour Items'}
                            </h1>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                            Manage labour roles, skill levels, and daily/OT rates.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            placeholder="Search roles, IDs..."
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
                        Add Labour
                    </Button>

                    <Button
                        variant="secondary"
                        leftIcon={<Archive className="w-4 h-4 shrink-0" />}
                        onClick={() => navigate('backup')}
                        className="text-xs h-9 px-3 shrink-0"
                    >
                        Backup
                    </Button>
                </div>
            </header>

            {/* Main Grid/Table View */}
            <main className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="border border-border rounded-xl bg-surface shadow-sm overflow-hidden min-w-[1000px]">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border bg-surface-hover/80 text-heading font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">S.No</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-3 w-32">Skill Level</th>
                                <th className="py-3 px-3 w-28">Daily (₹)</th>
                                <th className="py-3 px-3 w-28">Half (₹)</th>
                                <th className="py-3 px-3 w-24">OT/Hr (₹)</th>
                                <th className="py-3 px-3 w-24">Trend</th>
                                <th className="py-3 px-3 w-28">Status</th>
                                <th className="py-3 px-3 w-32">Notes</th>
                                <th className="py-3 px-4 w-24 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-xs">
                            {/* Top Inline Creation Row */}


                            {/* Data Loading State */}
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-muted font-medium">
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                                        Loading labour items...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 && !isAddingNew ? (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center text-muted font-medium">
                                        No labour items configured under this category.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item, idx) => {
                                    const isEditing = editingItemId === item._id;

                                    // --- EDIT MODE ROW ---
                                    if (isEditing) {
                                        return (
                                            <tr key={item._id} className="bg-surface-hover/50 border-y border-primary/20">
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 font-medium text-md rounded text-heading">

                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="p-2 pl-3">
                                                    <Input
                                                        autoFocus
                                                        value={editRowData.role || ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, role: e.target.value })}
                                                        className="h-8 text-xs font-medium bg-surface text-heading"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <select
                                                        value={editRowData.skillLevel || item.skillLevel}
                                                        onChange={(e) => setEditRowData({ ...editRowData, skillLevel: e.target.value as ISkillLevel })}
                                                        className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                                    >
                                                        {SKILL_LEVELS.map((level) => (
                                                            <option key={level} value={level}>{level}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={editRowData.rate ?? ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, rate: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs font-semibold text-primary bg-surface"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={editRowData.halfDayRate ?? ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, halfDayRate: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs font-medium bg-surface"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        type="number"
                                                        value={editRowData.otPerHour ?? ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, otPerHour: parseFloat(e.target.value) || 0 })}
                                                        className="h-8 text-xs font-medium bg-surface"
                                                    />
                                                </td>
                                                <td className="p-2 text-muted font-medium text-[11px]">—</td>
                                                <td className="p-2">
                                                    <select
                                                        value={editRowData.status || item.status}
                                                        onChange={(e) => setEditRowData({ ...editRowData, status: e.target.value as ILabourItemStatus })}
                                                        className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <Input
                                                        value={editRowData.notes || ''}
                                                        onChange={(e) => setEditRowData({ ...editRowData, notes: e.target.value })}
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

                                    // --- DISPLAY MODE ROW ---
                                    return (
                                        <tr key={item._id} className="hover:bg-surface-hover/50 transition-colors group">
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 font-medium text-md rounded text-heading">
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-heading text-sm">{item.role}</span>
                                                    <span className="text-[10px] text-muted font-mono mt-0.5">{item.refNo}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="px-2 py-0.5 font-medium text-[11px] rounded bg-page border border-border text-heading shadow-sm whitespace-nowrap">
                                                    {item.skillLevel}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-bold text-primary text-sm tracking-wide">
                                                ₹{item.rate.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-body font-medium">
                                                ₹{item.halfDayRate.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3 text-body font-medium">
                                                ₹{item.otPerHour.toLocaleString('en-IN')}
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
                                                {item.notes || '—'}
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
                                                        onClick={() => handleDeleteItem(item._id, item.role)}
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


                            {isAddingNew && (

                                <tr className="bg-primary/2 border-b-2 border-primary">
                                    {/* <td className="p-2 pl-3 font-medium text-heading"> */}
                                    <td className="py-3 px-3">
                                        <span className="px-2 py-0.5 font-medium text-md rounded text-heading">
                                            {filteredItems.length + 1}
                                        </span>
                                    </td>
                                    <td className="p-2 pl-3">
                                        <Input
                                            autoFocus
                                            placeholder="e.g., Lead Mason"
                                            value={newItem.role}
                                            onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
                                            className="h-8 text-xs font-medium bg-surface text-heading"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <select
                                            value={newItem.skillLevel}
                                            onChange={(e) => setNewItem({ ...newItem, skillLevel: e.target.value as ISkillLevel })}
                                            className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                        >
                                            {SKILL_LEVELS.map((level) => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newItem.rate || ''}
                                            onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                                            className="h-8 text-xs font-semibold text-primary bg-surface"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newItem.halfDayRate || ''}
                                            onChange={(e) => setNewItem({ ...newItem, halfDayRate: parseFloat(e.target.value) || 0 })}
                                            className="h-8 text-xs font-medium bg-surface"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={newItem.otPerHour || ''}
                                            onChange={(e) => setNewItem({ ...newItem, otPerHour: parseFloat(e.target.value) || 0 })}
                                            className="h-8 text-xs font-medium bg-surface"
                                        />
                                    </td>
                                    <td className="p-2 text-muted font-medium text-[11px]">—</td>
                                    <td className="p-2">
                                        <select
                                            value={newItem.status}
                                            onChange={(e) => setNewItem({ ...newItem, status: e.target.value as ILabourItemStatus })}
                                            className="h-8 w-full border border-border rounded-md px-2 bg-surface font-medium text-heading text-xs outline-none focus:border-primary"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <Input
                                            placeholder="Optional notes"
                                            value={newItem.notes}
                                            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
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
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};