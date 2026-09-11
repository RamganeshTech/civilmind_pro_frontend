import React, { useMemo, useState } from 'react';
import {
    Plus, Search, Edit, Trash2, Building2, Loader2, AlertCircle,
    Filter,
    X
} from 'lucide-react';
import {
    TableContainer, THead, Th, TBody, Tr, Td
} from '../../components/ui/Table'; // Adjust path
import { useDeleteProject, useInfiniteProjects } from '../../api_service/project_api/projectApi';
import { toast } from '../../components/ui/toast/Toast';
import { ProjectModal } from './ProjectModel';
import { Button } from '../../components/ui/Button';
import { SearchSelect } from '../../components/ui/SearchSelect';
import useDebounce from '../../hooks/useDebounce';


const STATUS_OPTIONS = [
    { label: 'Planning', value: 'Planning' },
    { label: 'Active', value: 'Active' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Completed', value: 'Completed' },
];

const PROJECT_TYPE_OPTIONS = [
    { label: 'Residential', value: 'Residential' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Renovation', value: 'Renovation' },
    { label: 'Apartment', value: 'Apartment' },
];

const FACING_OPTIONS = [
    { label: 'East', value: 'East' },
    { label: 'West', value: 'West' },
    { label: 'North', value: 'North' },
    { label: 'South', value: 'South' },
];

const ARCHIVE_OPTIONS = [
    { label: 'Active Projects Only', value: 'true' },
    { label: 'Archived Projects', value: 'false' },
    { label: 'All Projects', value: '' },
];

const SORT_BY_OPTIONS = [
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Project Name', value: 'projectName' },
    { label: 'Start Date', value: 'startDate' },
];

const ProjectMain: React.FC = () => {
    // Modal States
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<any | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        projectType: '',
        status: '',
        currentStage: '',
        basement: '',
        facingDirection: '',
        startDateFrom: '',
        startDateTo: '',
        isActive: 'true',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });


    // Debounce fast-changing inputs (500ms delay)
    const debouncedSearch = useDebounce(filters.search, 500);
    const debouncedStartDateFrom = useDebounce(filters.startDateFrom, 500);
    const debouncedStartDateTo = useDebounce(filters.startDateTo, 500);

    // Fetch Projects Data
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteProjects({
        limit: '15',
        ...filters,
        // clear out empty string filters so they aren't sent in query
        // search: filters.search || undefined,
        search: debouncedSearch || undefined,
        startDateFrom: debouncedStartDateFrom || undefined,
        startDateTo: debouncedStartDateTo || undefined,
        projectType: filters.projectType || undefined,
        status: filters.status || undefined,
        currentStage: filters.currentStage || undefined,
        basement: filters.basement || undefined,
        facingDirection: filters.facingDirection || undefined,
        // startDateFrom: filters.startDateFrom || undefined,
        // startDateTo: filters.startDateTo || undefined,
    });



    const allProjects = useMemo(() => {
        return data?.pages.flatMap((page) => page.projects) || [];
    }, [data]);

    // Delete Mutation 
    const { mutateAsync: deleteProjectAsync, isPending: isDeleting } = useDeleteProject();

    const handleDelete = async (projectId: string, projectCode: string) => {
        if (window.confirm(`Are you sure you want to delete project ${projectCode}?`)) {
            try {
                await deleteProjectAsync(projectId);
                toast.success(`Project ${projectCode} deleted successfully.`);
            } catch (err: any) {
                toast.error(err?.message || `Failed to delete project ${projectCode}.`);
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // NEW: Handler for SearchSelect components
    const handleSearchSelectChange = (name: string, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenCreate = () => {
        setProjectToEdit(null);
        setIsProjectModalOpen(true);
    };

    const handleOpenEdit = (project: any) => {
        setProjectToEdit(project);
        setIsProjectModalOpen(true);
    };

    const clearFilters = () => {
        setFilters({
            search: '', projectType: '', status: '', currentStage: '', basement: '', facingDirection: '',
            startDateFrom: '', startDateTo: '', isActive: 'true', sortBy: 'createdAt', sortOrder: 'desc',
        });
    };

    // Helper to colorize status badges based on your CSS variables
    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success border-success/20';
            case 'On Hold':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'Completed':
                return 'bg-body/10 text-body border-border';
            case 'Planning':
            default:
                return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    return (
        <div className="flex flex-col w-full h-screen max-h-screen bg-page p-4 sm:p-6 lg:p-8 overflow-hidden">

            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-semibold text-heading">Projects</h1>
                    <p className="text-sm text-muted mt-1">Manage and track all construction projects.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Mobile Filter Toggle Button */}
                    <Button
                        variant="secondary"
                        className="lg:hidden w-full sm:w-auto"
                        leftIcon={<Filter size={16} />}
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        Filters & Search
                    </Button>

                    <Button
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto"
                        leftIcon={<Plus size={16} />}
                        onClick={handleOpenCreate}
                    >
                        Add Project
                    </Button>
                </div>
            </div>

            {/* --- Main Content Layout (Responsive 25-30% Filters / 70-75% Table) --- */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 relative min-h-0">

                {/* MOBILE OVERLAY */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-heading/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                {/* LEFT PANEL: Filters & Search */}
                <div className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 shadow-2xl transition-transform duration-300 ease-in-out
          lg:static lg:w-[280px] xl:w-[320px] lg:shrink-0 lg:rounded-xl lg:shadow-sm lg:translate-x-0 lg:border
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="flex items-center justify-between lg:block border-b border-border pb-3 shrink-0">
                        <h3 className="font-semibold text-heading flex items-center gap-2">
                            <Filter size={16} className="text-muted" /> Advanced Filters
                        </h3>
                        <button className="lg:hidden text-muted hover:text-heading" onClick={() => setIsMobileFilterOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                        {/* Search */}
                        <div>
                            <label className="block text-sm text-body mb-1">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-muted" />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Code, name, client..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-surface border-border text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <SearchSelect
                            label="Status"
                            options={STATUS_OPTIONS}
                            value={filters.status}
                            onChange={(opt) => handleSearchSelectChange('status', String(opt.value))}
                            onClear={() => handleSearchSelectChange('status', '')}
                            placeholder="All Statuses"
                        />

                        <SearchSelect
                            label="Project Type"
                            options={PROJECT_TYPE_OPTIONS}
                            value={filters.projectType}
                            onChange={(opt) => handleSearchSelectChange('projectType', String(opt.value))}
                            onClear={() => handleSearchSelectChange('projectType', '')}
                            placeholder="All Types"
                        />

                        <SearchSelect
                            label="Facing Direction"
                            options={FACING_OPTIONS}
                            value={filters.facingDirection}
                            onChange={(opt) => handleSearchSelectChange('facingDirection', String(opt.value))}
                            onClear={() => handleSearchSelectChange('facingDirection', '')}
                            placeholder="All Directions"
                        />

                        <SearchSelect
                            label="Archive Status"
                            options={ARCHIVE_OPTIONS}
                            value={filters.isActive}
                            onChange={(opt) => handleSearchSelectChange('isActive', String(opt.value))}
                            onClear={() => handleSearchSelectChange('isActive', '')}
                            placeholder="All Projects"
                        />

                        <SearchSelect
                            label="Sort By"
                            options={SORT_BY_OPTIONS}
                            value={filters.sortBy}
                            onChange={(opt) => handleSearchSelectChange('sortBy', String(opt.value))}
                            onClear={() => handleSearchSelectChange('sortBy', 'createdAt')} // Default sort fallback
                            placeholder="Sort By..."
                        />

                    </div>

                    <div className="mt-auto pt-4 border-t border-border shrink-0">
                        <Button variant="outline" className="w-full mb-2" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                        <Button variant="primary" className="w-full lg:hidden" onClick={() => setIsMobileFilterOpen(false)}>
                            Apply Filters
                        </Button>
                    </div>
                </div>

                {/* RIGHT PANEL: Data Table (70%) */}
                <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
                    {isLoading && !data ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : isError ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-danger">
                            <AlertCircle className="w-8 h-8 mb-4" />
                            <p className="text-sm font-medium">{error?.message || 'Failed to load projects.'}</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <TableContainer className="h-full border-none shadow-none rounded-none">
                                <THead className="sticky top-0 z-10">
                                    <tr>
                                        <Th>Code</Th>
                                        <Th>Name & Client</Th>
                                        <Th>Type</Th>
                                        <Th>Status</Th>
                                        <Th className="text-right">Actions</Th>
                                    </tr>
                                </THead>
                                <TBody>
                                    {allProjects.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center text-muted">
                                                    <Building2 className="w-10 h-10 mb-3 opacity-50" />
                                                    <p className="text-base font-medium text-body">No projects found</p>
                                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                                                        Clear Filters
                                                    </Button>
                                                </div>
                                            </Td>
                                        </Tr>
                                    ) : (
                                        <>
                                            {allProjects.map((project: any) => (
                                                <Tr key={project._id}>
                                                    <Td><span className="font-medium text-heading">{project.projectCode || '-'}</span></Td>
                                                    <Td>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-heading">{project.projectName}</span>
                                                            <span className="text-xs text-muted">{project.clientName}</span>
                                                        </div>
                                                    </Td>
                                                    <Td>{project.projectType}</Td>
                                                    <Td>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(project.status)}`}>
                                                            {project.status}
                                                        </span>
                                                    </Td>
                                                    <Td className="text-right">
                                                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(project)}>
                                                                <Edit size={16} className="text-muted hover:text-primary transition-colors" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled={isDeleting}
                                                                onClick={() => handleDelete(project._id, project.projectCode)}
                                                            >
                                                                <Trash2 size={16} className="text-muted hover:text-danger transition-colors" />
                                                            </Button>
                                                        </div>
                                                    </Td>
                                                </Tr>
                                            ))}

                                            {hasNextPage && (
                                                <Tr>
                                                    <Td colSpan={5} className="text-center py-4">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            isLoading={isFetchingNextPage}
                                                            loadingText="Loading more..."
                                                            onClick={() => fetchNextPage()}
                                                        >
                                                            Load More
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            )}
                                        </>
                                    )}
                                </TBody>
                            </TableContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Unified Modal --- */}
            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                editData={projectToEdit}
            />
        </div>
    );
};


export default ProjectMain