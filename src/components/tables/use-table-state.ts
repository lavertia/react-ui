import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import type { ComponentNode, TableColumn } from '@lavertia/ui';
import {
    tableColumns, tableRows, visibleTableRows, tableFilters,
    tableColumnsInOrder, defaultHiddenColumns, tableStateUrl, translate,
} from '@lavertia/ui';

type SortDirection = 'asc' | 'desc';

/**
 * Framework-neutral table data protocol; React manages ephemeral UI state.
 * Snapshot mode operates locally; Eloquent mode navigates server-owned URLs.
 * UI Kits can render their own Table markup without duplicating query logic.
 */
export function useTableState(node: ComponentNode) {
    const columns = tableColumns(node);
    const filters = tableFilters(node);
    const mode = node.props.mode === 'eloquent' ? 'eloquent' : 'snapshot';
    const locale = node.props.locale;
    const tx = (key: Parameters<typeof translate>[1]) => translate(locale, key);
    const rows = tableRows(node);
    const [search, setSearch] = useState(String(node.props.appliedSearch ?? ''));
    const [sortKey, setSortKey] = useState<string | null>(
        typeof node.props.appliedSort === 'string' ? node.props.appliedSort : null,
    );
    const [direction, setDirection] = useState<SortDirection>(node.props.appliedDirection === 'desc' ? 'desc' : 'asc');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(
        (node.props.appliedFilters as Record<string, string> | undefined) ?? {},
    );
    const [hidden, setHidden] = useState<string[]>(() => defaultHiddenColumns(columns));
    const [order, setOrder] = useState<string[]>(() => columns.map((column) => column.key));
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const visibleColumns = tableColumnsInOrder(columns, order, hidden);
    const filtered = mode === 'eloquent' ? rows : visibleTableRows(rows, columns, search, sortKey, direction, selectedFilters);
    const pageRows = mode === 'eloquent' ? filtered : filtered.slice((page - 1) * pageSize, page * pageSize);
    const lastPage = mode === 'eloquent'
        ? Number((node.props.pagination as { lastPage?: number } | undefined)?.lastPage ?? 1)
        : Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = mode === 'eloquent'
        ? Number((node.props.pagination as { page?: number } | undefined)?.page ?? 1)
        : Math.min(page, lastPage);
    const title = String(node.props.label ?? node.props.name ?? 'Records');
    const pagination = node.props.pagination as { total?: number; nextUrl?: string | null; previousUrl?: string | null } | undefined;

    useEffect(() => {
        if (mode === 'eloquent') {
            setSearch(String(node.props.appliedSearch ?? ''));
            setSelectedFilters((node.props.appliedFilters as Record<string, string> | undefined) ?? {});
            setSortKey(typeof node.props.appliedSort === 'string' ? node.props.appliedSort : null);
            setDirection(node.props.appliedDirection === 'desc' ? 'desc' : 'asc');
        }
    }, [mode, node.props.appliedSearch, node.props.appliedFilters, node.props.appliedSort, node.props.appliedDirection]);

    function navigate(changes: Record<string, string | null>) {
        router.get(tableStateUrl(node, changes), {}, { preserveScroll: true, preserveState: true, replace: true });
    }

    function sort(column: TableColumn) {
        if (!column.sortable) return;
        const next = column.key === sortKey && direction === 'asc' ? 'desc' : 'asc';
        setSortKey(column.key);
        setDirection(next);
        if (mode === 'eloquent') navigate({ sort: column.key, direction: next });
        else setPage(1);
    }

    function applyFilter(key: string, value: string) {
        setSelectedFilters((old) => ({ ...old, [key]: value }));
        if (mode === 'eloquent') navigate({ ['filter_' + key]: value || null });
        else setPage(1);
    }

    function move(column: string, step: number) {
        setOrder((previous) => {
            const next = [...previous];
            const from = next.indexOf(column);
            const to = from + step;
            if (from < 0 || to < 0 || to >= next.length) return previous;
            [next[from], next[to]] = [next[to], next[from]];
            return next;
        });
    }

    function reset() {
        setSearch('');
        setSortKey(null);
        setDirection('asc');
        setSelectedFilters({});
        setHidden(defaultHiddenColumns(columns));
        setOrder(columns.map((column) => column.key));
        setPage(1);
        if (mode === 'eloquent') {
            const keys: Record<string, string | null> = {
                search: null, sort: null, direction: null,
            };
            filters.forEach((filter) => { keys['filter_' + filter.key] = null; });
            navigate(keys);
        }
    }


    return {
        columns, filters, mode, tx, rows, search, setSearch, sortKey, direction,
        selectedFilters, setSelectedFilters, hidden, setHidden, order, page,
        setPage, visibleColumns, filtered, pageRows, lastPage, currentPage,
        title, pagination, navigate, sort, applyFilter, move, reset,
    };
}
