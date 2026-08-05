// components/ui/Dropdown.tsx
import {
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

export interface DropdownItem {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    isDanger?: boolean;
    disabled?: boolean;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    /** Accessible name for the trigger when it's icon-only, e.g. "More actions" */
    triggerLabel?: string;
}

const MENU_WIDTH = 192; // w-48
const VIEWPORT_PADDING = 8;

export const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    align = 'right',
    triggerLabel = 'More actions',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // const menuId = useRef(`dropdown-menu-${Math.random().toString(36).slice(2)}`).current;

    const generatedId = useId();
    const menuId = `dropdown-menu-${generatedId}`;

    const computePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();

        let left = align === 'right' ? rect.right - MENU_WIDTH : rect.left;
        // Clamp horizontally so the menu never runs off either edge on small screens
        left = Math.min(Math.max(left, VIEWPORT_PADDING), window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING);

        const estimatedMenuHeight = items.length * 40 + 12;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
        const top = openUpward ? rect.top - estimatedMenuHeight - 4 : rect.bottom + 4;

        setCoords({ top, left });
    };

    const openMenu = () => {
        computePosition();
        setIsOpen(true);
        setActiveIndex(-1);
    };

    const closeMenu = (returnFocus = true) => {
        setIsOpen(false);
        setActiveIndex(-1);
        if (returnFocus) triggerRef.current?.focus();
    };

    const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            openMenu();
            setActiveIndex(0);
        }
    };

    // Focus the active menu item
    useEffect(() => {
        if (isOpen && activeIndex >= 0) {
            itemRefs.current[activeIndex]?.focus();
        }
    }, [isOpen, activeIndex]);

    // Reposition on scroll/resize while open
    useEffect(() => {
        if (!isOpen) return;
        const handleReposition = () => computePosition();
        const handleClickOutside = (e: MouseEvent) => {
            if (
                !menuRef.current?.contains(e.target as Node) &&
                !triggerRef.current?.contains(e.target as Node)
            ) {
                closeMenu(false);
            }
        };

        window.addEventListener('scroll', handleReposition, true);
        window.addEventListener('resize', handleReposition);
        const timer = setTimeout(() => document.addEventListener('click', handleClickOutside), 0);

        return () => {
            window.removeEventListener('scroll', handleReposition, true);
            window.removeEventListener('resize', handleReposition);
            document.removeEventListener('click', handleClickOutside);
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const enabledIndices = items.reduce<number[]>((acc, item, i) => {
        if (!item.disabled) acc.push(i);
        return acc;
    }, []);

    const moveActive = (direction: 1 | -1) => {
        if (enabledIndices.length === 0) return;
        const currentPos = enabledIndices.indexOf(activeIndex);
        const nextPos =
            currentPos === -1
                ? direction === 1
                    ? 0
                    : enabledIndices.length - 1
                : (currentPos + direction + enabledIndices.length) % enabledIndices.length;
        setActiveIndex(enabledIndices[nextPos]);
    };

    const handleMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                moveActive(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                moveActive(-1);
                break;
            case 'Home':
                e.preventDefault();
                setActiveIndex(enabledIndices[0] ?? -1);
                break;
            case 'End':
                e.preventDefault();
                setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
                break;
            case 'Escape':
                e.preventDefault();
                closeMenu();
                break;
            case 'Tab':
                closeMenu(false);
                break;
        }
    };

    const menu = (
        <div
            ref={menuRef}
            role="menu"
            id={menuId}
            aria-orientation="vertical"
            onKeyDown={handleMenuKeyDown}
            className={cn(
                'fixed z-[9999] w-48 rounded-xl shadow-lg bg-bg-surface border border-border p-1.5',
                'flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150'
            )}
            style={{ top: coords.top, left: coords.left }}
        >
            {items.map((item, index) => (
                <button
                    key={item.label}
                    //   ref={(el) => (itemRefs.current[index] = el)}
                    ref={(el) => {
                        itemRefs.current[index] = el;
                    }}
                    role="menuitem"
                    tabIndex={-1}
                    disabled={item.disabled}
                    onClick={() => {
                        item.onClick();
                        closeMenu();
                    }}
                    className={cn(
                        'w-full text-left flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors group outline-none',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        item.isDanger
                            ? 'text-danger hover:bg-danger/10 focus:bg-danger/10'
                            : 'text-text-body hover:bg-bg-surface-hover hover:text-text-heading focus:bg-bg-surface-hover focus:text-text-heading'
                    )}
                >
                    {item.icon && (
                        <span
                            className={cn(
                                'shrink-0 w-5 flex justify-center mr-2.5',
                                item.isDanger ? 'text-danger/70' : 'text-text-muted group-hover:text-brand-primary'
                            )}
                            aria-hidden="true"
                        >
                            {item.icon}
                        </span>
                    )}
                    {item.label}
                </button>
            ))}
        </div>
    );

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={isOpen ? menuId : undefined}
                aria-label={typeof trigger === 'string' ? undefined : triggerLabel}
                // onClick={(e) => {
                //     e.stopPropagation();
                //     isOpen ? closeMenu() : openMenu();
                // }}

                // AFTER
                onClick={(e) => {
                    e.stopPropagation();
                    if (isOpen) {
                        closeMenu();
                    } else {
                        openMenu();
                    }
                }}
                onKeyDown={handleTriggerKeyDown}
                className="inline-flex items-center justify-center cursor-pointer outline-none rounded-md focus-visible:ring-2 focus-visible:ring-brand-primary/30"
            >
                {trigger}
            </button>

            {isOpen && createPortal(menu, document.body)}
        </>
    );
};