import type { ComponentNode } from '@lavertia/ui';
import { statAccentClass } from '@lavertia/ui';
import { useUiRegistry } from './registry.js';
import { FormRenderer } from './components/forms/form-renderer.js';
import { TablePreview } from './components/tables/table-preview.js';
import { ActionLink } from './components/actions/action-link.js';
import { BasicFieldRenderer } from './components/fields/basic-fields.js';

export default function LavertiaRenderer({ node }: { node: ComponentNode }) {
    const { registry, kitId } = useUiRegistry();
    const children = node.components.map((child) => <LavertiaRenderer key={child.key} node={child} />);

    const CustomRenderer = registry.resolve(node.type, kitId);
    if (CustomRenderer) {
        return <CustomRenderer node={node}>{children}</CustomRenderer>;
    }

    switch (node.type) {
        case 'container':
        case 'column':
            return <div className="flex min-w-0 flex-col gap-6">{children}</div>;

        case 'row':
            return <div className="flex min-w-0 flex-wrap items-start gap-4">{children}</div>;

        case 'page-header':
            return (
                <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
                    <div className="min-w-0">
                        {typeof node.props.eyebrow === 'string' && node.props.eyebrow.length > 0 && <p className="mb-2 text-xs font-bold uppercase tracking-widest lvt-eyebrow">{String(node.props.eyebrow)}</p>}
                        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl dark:text-white">{String(node.props.title ?? 'Overview')}</h1>
                        {typeof node.props.description === 'string' && node.props.description.length > 0 && <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">{String(node.props.description)}</p>}
                    </div>
                    {children.length > 0 && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
                </header>
            );

        case 'stats-grid':
            return <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;

        case 'stat':
            return (
                <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/70">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{String(node.props.label ?? '')}</p>
                        <span aria-hidden="true" className={'size-2.5 rounded-full ring-4 ' + statAccentClass(node.props.tone)} />
                    </div>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">{String(node.props.value ?? '—')}</p>
                    {typeof node.props.description === 'string' && node.props.description.length > 0 && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{String(node.props.description)}</p>}
                </article>
            );

        case 'section':
            return (
                <section className="space-y-4" aria-label={String(node.props.title ?? 'Section')}>
                    <div>
                        <h2 className="text-base font-semibold text-gray-950 dark:text-white">{String(node.props.title ?? '')}</h2>
                        {typeof node.props.description === 'string' && node.props.description.length > 0 && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{String(node.props.description)}</p>}
                    </div>
                    <div className="flex min-w-0 flex-col gap-4">{children}</div>
                </section>
            );

        case 'card':
            return <section className="flex min-w-0 flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900/70">{children}</section>;

        case 'text':
            return <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">{String(node.props.content ?? '')}</p>;

        case 'infolist':
            return (
                <dl className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    {children}
                </dl>
            );

        case 'text-entry':
            return (
                <div className="min-w-0">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{String(node.props.label ?? node.props.name ?? '')}</dt>
                    <dd className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-gray-100">{String(node.props.value ?? '—')}</dd>
                </div>
            );

case 'form':
            return <FormRenderer node={node}>{children}</FormRenderer>;

        case 'select':
        case 'textarea':
        case 'checkbox':
        case 'text-input':
            return <BasicFieldRenderer node={node} />;

        case 'table':
            return <TablePreview node={node} />;

        case 'action':
            return <ActionLink node={node} />;

        case 'text-column':
            return null;

        default:
            return <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">Unsupported component: {node.type}</p>;
    }
}
