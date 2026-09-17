// pages/BoqMain.tsx
import React, { useState, useMemo } from 'react';
import {
    Search,
    Plus,
    FileSpreadsheet,
    Eye,
    Trash2,
    Filter
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import {
    TableContainer,
    THead, Th, TBody, Tr, Td
} from '../../components/ui/Table';
import { useGetAllBOQ, type IBOQ } from '../../api_service/boq_api/boqApi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const BoqMain: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: boqs = [], isLoading } = useGetAllBOQ();

    // Filter Logic
    const filteredBoqs = useMemo(() => {
        return boqs.filter((boq: IBOQ) => {
            const matchesSearch = boq.boqNo?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || boq.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [boqs, searchTerm, statusFilter]);

    // Action Handlers
   // 1. For Creation:
  const handleCreateBOQ = () => {
    navigate('single/new?isCreated=true');
  };

  // 2. For Updating/Viewing an existing BOQ:
  const handleView = (boqId: string) => {
    navigate(`single/${boqId}?isCreated=false&boqId=${boqId}`);
  };

    // Helper for status badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-md border border-success/20">Approved</span>;
            case 'superseded':
                return <span className="px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-md border border-warning/20">Superseded</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium bg-muted/10 text-muted rounded-md border border-muted/20">Draft</span>;
        }
    };



    const isChild = location.pathname.includes("single")

    if (isChild) {
        return <Outlet />
    }



    return (
        <div className="flex flex-col md:flex-row h-full min-h-screen bg-page text-body">

            {/* ── LEFT PANEL: FILTERS (30%) ────────────────────────────────────────── */}
            <aside className="w-full md:w-[30%] lg:w-1/4 bg-surface border-r border-border flex flex-col">
                <div className="p-4 sm:p-6 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <Filter className="w-5 h-5 text-primary shrink-0" />
                        <h2 className="text-lg font-semibold text-heading leading-tight">Filters</h2>
                    </div>
                    <p className="text-xs text-muted mt-1">Refine the BOQ list</p>
                </div>

                <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Search Filter */}
                    <div className="space-y-1.5">
                        <Label htmlFor="search-boq">Search BOQ No.</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <Input
                                id="search-boq"
                                placeholder="e.g., BOQ-001..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1.5">
                        <Label htmlFor="status-filter">Status</Label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full flex h-10 rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="all">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="approved">Approved</option>
                            <option value="superseded">Superseded</option>
                        </select>
                    </div>
                </div>
            </aside>

            {/* ── RIGHT PANEL: CONTENT & TABLE (70%) ───────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-surface border-b border-border shadow-xs">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <FileSpreadsheet className="w-5 h-5 text-primary shrink-0" />
                            <h1 className="text-lg sm:text-xl font-semibold text-heading leading-tight">
                                Bill of Quantities (BOQ)
                            </h1>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                            Manage estimates, generation pipelines, and cost calculations.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={handleCreateBOQ}
                        className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    >
                        Create BOQ
                    </Button>
                </header>

                {/* Table Area */}
                <div className="flex-1 p-4 sm:p-6 overflow-auto bg-page">
                    <TableContainer ariaLabel="Bill of Quantities List">
                        <THead>
                            <tr>
                                <Th>BOQ No.</Th>
                                <Th>Status</Th>
                                <Th>Version</Th>
                                <Th className="text-right">Materials Cost</Th>
                                <Th className="text-right">Labour Cost</Th>
                                <Th className="text-right">Total Cost</Th>
                                <Th className="text-center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {isLoading ? (
                                <Tr>
                                    <Td colSpan={7} className="text-center py-12">
                                        Loading BOQs...
                                    </Td>
                                </Tr>
                            ) : filteredBoqs.length === 0 ? (
                                <Tr>
                                    <Td colSpan={7} className="text-center py-12">
                                        <p className="text-heading font-medium">No BOQs found</p>
                                        <p className="text-xs text-muted mt-1">Adjust your filters or create a new BOQ.</p>
                                    </Td>
                                </Tr>
                            ) : (
                                filteredBoqs.map((boq: IBOQ) => (
                                    <Tr key={boq._id}>
                                        <Td className="font-medium text-heading">
                                            {boq.boqNo || 'Draft'}
                                        </Td>
                                        <Td>
                                            {getStatusBadge(boq.status)}
                                        </Td>
                                        <Td className="text-muted">
                                            v{boq.version}
                                        </Td>
                                        <Td className="text-right text-muted">
                                            ₹{boq.materialsTotal?.toLocaleString('en-IN') || '0'}
                                        </Td>
                                        <Td className="text-right text-muted">
                                            ₹{boq.labourTotal?.toLocaleString('en-IN') || '0'}
                                        </Td>
                                        <Td className="text-right font-medium text-heading">
                                            ₹{boq.totalCost?.toLocaleString('en-IN') || '0'}
                                        </Td>
                                        <Td>
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(boq._id)}
                                                    className="h-8 w-8 p-0 text-muted hover:text-primary shrink-0"
                                                    aria-label={`View ${boq.boqNo}`}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    // onClick={() => handleDelete(boq._id)}
                                                    className="h-8 w-8 p-0 text-muted hover:text-danger shrink-0"
                                                    aria-label={`Delete ${boq.boqNo}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </TableContainer>
                </div>
            </main>
        </div>
    );
};