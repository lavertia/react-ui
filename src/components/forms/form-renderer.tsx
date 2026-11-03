import type { ReactNode } from 'react';
import { translate } from '@lavertia/ui';
import type { ComponentNode } from '@lavertia/ui';
import { useFormSubmission } from './use-form-submission.js';

export function FormRenderer({ node, children }: { node: ComponentNode; children: ReactNode }) {
    const { action, submit, errors, saved, processing } = useFormSubmission(node);
    const tx = (key: Parameters<typeof translate>[1]) => translate(node.props.locale, key);

    return <form method="post" action={action ?? undefined} onSubmit={submit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900/70">
        <h3 className="text-sm font-semibold">{String(node.props.label ?? node.props.name ?? '')}</h3>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        {Object.keys(errors).length > 0 && <ul role="alert" className="list-disc space-y-1 ps-5 text-sm text-rose-600">
            {Object.entries(errors).map(([name, message]) => <li key={name}>{name}: {message}</li>)}
        </ul>}
        {saved && <p role="status" className="text-sm text-emerald-700">{tx('saved')}</p>}
        {action ? <button type="submit" disabled={processing}
            className="rounded-lg lvt-primary px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {processing ? tx('saving') : String(node.props.submitLabel ?? tx('submit'))}
        </button> : <p role="status" className="text-xs text-gray-500">{tx('draft')}</p>}
    </form>;
}
