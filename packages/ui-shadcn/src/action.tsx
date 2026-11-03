import { Link } from '@inertiajs/react';
import { safeHref } from '@lavertia/ui';
import type { UiComponentProps } from '@lavertia/react-ui';
import type { ActionVariant, ShadcnPrimitives } from './primitives.js';

/** Inertia navigation for local links; safe external URLs are normal anchors. */
export function createShadcnAction({ buttonClassName }: ShadcnPrimitives) {
    return function ShadcnAction({ node }: UiComponentProps) {
        const label = String(node.props.label ?? node.props.name ?? 'Action');
        const href = safeHref(node.props.href);
        const variant: ActionVariant = node.props.appearance === 'primary'
            ? 'default' : node.props.appearance === 'outline' ? 'outline' : 'secondary';
        const styles = buttonClassName?.(variant)
            ?? 'border-border bg-background text-foreground focus-visible:ring-ring inline-flex min-h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:outline-none';

        if (!href) {
            return <span className="text-muted-foreground text-sm">{label}</span>;
        }
        if (href.startsWith('/')) {
            return <Link href={href} className={styles}>{label}</Link>;
        }
        return <a href={href} className={styles} rel="noopener noreferrer">{label}</a>;
    };
}
