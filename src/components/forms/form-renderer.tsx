import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { translate } from '@lavertia/ui';
import type { ComponentNode } from '@lavertia/ui';

export function FormRenderer({ node, children }: { node: ComponentNode; children: ReactNode }) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);
    const action = typeof node.props.action === 'string'
        && node.props.action.startsWith('/') && !node.props.action.startsWith('//')
        ? node.props.action : null;
    const method: 'post' | 'put' | 'patch' =
        node.props.method === 'put' || node.props.method === 'patch' ? node.props.method : 'post';
    const tx = (key: Parameters<typeof translate>[1]) => translate(node.props.locale, key);

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        if (!action || processing) return;

        const data: Record<string, string> = {};
        for (const [name, value] of new FormData(event.currentTarget).entries()) {
            if (typeof value === 'string') data[name] = value;
        }

        setSaved(false);
        setErrors({});
        setProcessing(true);
        router.visit(action, {
            method,
            data,
            preserveScroll: true,
            onSuccess: () => setSaved(true),
            onError: (validationErrors) => setErrors(validationErrors),
            onFinish: () => setProcessing(false),
        });
    }

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
