import { useState } from 'react';
import type { FormEvent } from 'react';
import { router } from '@inertiajs/react';
import { safeHref } from '@lavertia/ui';
import type { ComponentNode } from '@lavertia/ui';

/**
 * Inertia-backed mutation behavior shared across UI Kits. Presentation stays
 * in each Kit. Laravel remains the authoritative validator and gatekeeper.
 */
export function useFormSubmission(node: ComponentNode) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);

    const href = safeHref(node.props.action);
    const action = href?.startsWith('/') ? href : null;
    const method: 'post' | 'put' | 'patch' =
        node.props.method === 'put' || node.props.method === 'patch' ? node.props.method : 'post';

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        if (!action || processing) {
            return;
        }

        const data: Record<string, string> = {};
        for (const [name, value] of new FormData(event.currentTarget).entries()) {
            if (typeof value === 'string') {
                data[name] = value;
            }
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

    return { action, method, submit, errors, saved, processing };
}
