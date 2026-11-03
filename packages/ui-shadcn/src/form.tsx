import type { ReactNode } from 'react';
import { translate } from '@lavertia/ui';
import type { UiComponentProps } from '@lavertia/react-ui';
import { useFormSubmission } from '@lavertia/react-ui';
import type { ShadcnPrimitives } from './primitives.js';

/** Reuse Inertia actions from Lavertia; presentation belongs to the Kit. */
export function createShadcnForm({ Button }: ShadcnPrimitives) {
    return function ShadcnForm({ node, children }: UiComponentProps): ReactNode {
        const { action, errors, saved, processing, submit } = useFormSubmission(node);
        const tx = (key: Parameters<typeof translate>[1]) => translate(node.props.locale, key);
        return (
            <form method="post" action={action ?? undefined} onSubmit={submit}
                className="border-border bg-card text-card-foreground grid gap-5 rounded-xl border p-5 shadow-sm">
                <h3 className="text-sm font-semibold">{String(node.props.label ?? node.props.name ?? '')}</h3>
                <div className="grid gap-4 md:grid-cols-2">{children}</div>
                {Object.keys(errors).length > 0 && (
                    <ul role="alert" className="text-destructive list-disc space-y-1 ps-5 text-sm">
                        {Object.entries(errors).map(([name, message]) => <li key={name}>{name}: {message}</li>)}
                    </ul>
                )}
                {saved && <p role="status" className="text-emerald-600 text-sm">{tx('saved')}</p>}
                {action ? (
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? tx('saving') : String(node.props.submitLabel ?? tx('submit'))}
                        </Button>
                    </div>
                ) : <p role="status" className="text-muted-foreground text-xs">{tx('draft')}</p>}
            </form>
        );
    };
}
