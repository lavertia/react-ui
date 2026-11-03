import { Link } from '@inertiajs/react';
import type { ComponentNode } from '@lavertia/ui';
import { badgeClass, columnBadgeTone } from '@lavertia/ui';
import { useTableState } from './use-table-state.js';

/** The built-in renderer remains the stable visual fallback for every UI Kit. */
export function TablePreview({ node }: { node: ComponentNode }) {
    const {
        columns, filters, mode, tx, search, setSearch, sortKey, direction,
        selectedFilters, hidden, setHidden, order, setPage, visibleColumns, filtered,
        pageRows, lastPage, currentPage, title, pagination, navigate,
        sort, applyFilter, move, reset,
    } = useTableState(node);

    return (
        <section aria-label={title} className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900/70">
            <header className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-950 dark:text-white">{title}</h3>
                        {typeof node.props.description === 'string' && node.props.description.length > 0 && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{String(node.props.description)}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {node.props.columnManager !== false && (
                            <details className="group relative">
                                <summary className="cursor-pointer list-none rounded-md border border-gray-300 px-3 py-2 text-xs font-medium focus-visible:outline-2 lvt-focus dark:border-white/20">{tx('columns')}</summary>
                                <div className="absolute end-0 z-20 mt-2 w-64 space-y-1 rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                                    {columns.filter((c) => !c.hidden).map((column) => (
                                        <div key={column.key} className="flex items-center gap-2 py-1 text-xs">
                                            <label className="flex min-w-0 flex-1 items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={!hidden.includes(column.key)}
                                                    disabled={!column.toggleable || (!hidden.includes(column.key) && visibleColumns.length <= 1)}
                                                    onChange={(event) => setHidden((before) =>
                                                        event.target.checked ? before.filter((key) => key !== column.key) : [...before, column.key],
                                                    )}
                                                />
                                                <span className="truncate">{column.label}</span>
                                            </label>
                                            {node.props.reorderableColumns === true && (
                                                <>
                                                    <button type="button" aria-label={tx('moveLeft') + ': ' + column.label} disabled={order.indexOf(column.key) === 0} onClick={() => move(column.key, -1)} className="rounded p-1 disabled:opacity-30">↑</button>
                                                    <button type="button" aria-label={tx('moveRight') + ': ' + column.label} disabled={order.indexOf(column.key) === order.length - 1} onClick={() => move(column.key, 1)} className="rounded p-1 disabled:opacity-30">↓</button>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={reset} className="w-full rounded bg-gray-100 px-2 py-1.5 text-xs dark:bg-gray-800">{tx('reset')}</button>
                                </div>
                            </details>
                        )}
                        {node.props.searchable === true && (
                            <form onSubmit={(event) => { event.preventDefault(); if (mode === 'eloquent') navigate({ search }); else setPage(1); }} className="flex gap-1">
                                <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); if (mode === 'snapshot') setPage(1); }}
                                    placeholder={tx('search')} aria-label={tx('search')}
                                    className="w-44 min-w-0 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-2 lvt-focus sm:w-56 dark:border-white/20" />
                                {mode === 'eloquent' && <button type="submit" className="rounded-md lvt-primary px-3 text-xs font-semibold">{tx('search')}</button>}
                            </form>
                        )}
                    </div>
                </div>
                {filters.length > 0 && (
                    <div className="flex flex-wrap items-end gap-2">
                        {filters.map((filter) => (
                            <label key={filter.key} className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                                {filter.label}
                                <select value={selectedFilters[filter.key] ?? ''} onChange={(event) => applyFilter(filter.key, event.target.value)}
                                    className="min-w-32 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 dark:border-white/20 dark:bg-gray-950 dark:text-white">
                                    <option value="">{tx('filters')}: {filter.label}</option>
                                    {Object.entries(filter.options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
                                </select>
                            </label>
                        ))}
                        <button type="button" onClick={reset} className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50 dark:border-white/20 dark:hover:bg-white/5">{tx('reset')}</button>
                    </div>
                )}
            </header>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-white/10">
                    <thead className="bg-gray-50/80 dark:bg-white/[0.03]"><tr>
                        {visibleColumns.map((column) => <th key={column.key} scope="col" aria-sort={column.sortable ? sortKey === column.key ? direction === 'asc' ? 'ascending' : 'descending' : 'none' : undefined}
                            className="whitespace-nowrap px-5 py-3 text-start text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {column.sortable
                                ? <button type="button" onClick={() => sort(column)} className="rounded focus-visible:outline-2 lvt-focus">{column.label} <span aria-hidden="true">↕</span></button>
                                : column.label}
                        </th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.07]">
                        {pageRows.map((row, index) => <tr key={String(row.id ?? index)} className="hover:bg-gray-50 dark:hover:bg-white/[0.035]">
                            {visibleColumns.map((column) => <td key={column.key} className="whitespace-nowrap px-5 py-3.5">
                                {column.badge
                                    ? <span className={'inline-flex rounded-md px-2 py-1 text-xs ring-1 ring-inset ' + badgeClass(columnBadgeTone(column, row[column.key]))}>{String(row[column.key] ?? '—')}</span>
                                    : <span>{String(row[column.key] ?? '—')}</span>}
                            </td>)}
                        </tr>)}
                    </tbody>
                </table>
                {pageRows.length === 0 && <div className="px-5 py-12 text-center text-sm text-gray-500">{tx('noResults')}</div>}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-3 text-xs dark:border-white/10">
                <span aria-live="polite">{tx('show')} {mode === 'eloquent' ? pagination?.total ?? 0 : filtered.length} {tx('records')}</span>
                <nav aria-label={tx('page')} className="flex items-center gap-2">
                    {mode === 'eloquent'
                        ? <>
                            {pagination?.previousUrl ? <Link href={pagination.previousUrl} preserveScroll className="rounded border px-2 py-1.5">{tx('previous')}</Link> : <span className="opacity-40">{tx('previous')}</span>}
                            <span>{tx('page')} {currentPage} {tx('of')} {lastPage}</span>
                            {pagination?.nextUrl ? <Link href={pagination.nextUrl} preserveScroll className="rounded border px-2 py-1.5">{tx('next')}</Link> : <span className="opacity-40">{tx('next')}</span>}
                        </>
                        : <>
                            <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded border px-2 py-1.5 disabled:opacity-40">{tx('previous')}</button>
                            <span>{tx('page')} {currentPage} {tx('of')} {lastPage}</span>
                            <button type="button" disabled={currentPage >= lastPage} onClick={() => setPage(currentPage + 1)} className="rounded border px-2 py-1.5 disabled:opacity-40">{tx('next')}</button>
                        </>}
                </nav>
            </footer>
        </section>
    );

}
