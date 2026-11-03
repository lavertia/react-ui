import { Link } from '@inertiajs/react';
import { safeHref } from '@lavertia/ui';
import type { ComponentNode } from '@lavertia/ui';

export function ActionLink({ node }: { node: ComponentNode }) {
    const label = String(node.props.label ?? node.props.name ?? 'Action');
    const href = safeHref(node.props.href);
    const appearance = node.props.appearance;
    const base = 'inline-flex min-h-9 items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lvt-focus';
    const variant = appearance === 'primary'
        ? 'lvt-primary shadow-sm'
        : appearance === 'outline'
            ? 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10'
            : 'border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:border-white/15 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700';
    const classes = base + ' ' + variant;

    if (!href) return <span className="text-sm text-gray-500">{label}</span>;
    if (href.startsWith('/')) return <Link href={href} className={classes}>{label}</Link>;

    return <a href={href} className={classes} rel="noopener noreferrer">{label}</a>;
}
