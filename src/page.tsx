import { Head } from '@inertiajs/react';
import { activeUiKitId } from '@lavertia/ui';
import '@lavertia/ui/theme.css';
import type { LavertiaPayload } from '@lavertia/ui';
import LavertiaRenderer from './renderer.js';
import { defaultUiRegistry, UiRegistryProvider } from './registry.js';
import type { UiRegistry } from './registry.js';
import { DefaultPageShell } from './shells/default-page-shell.js';

export default function LavertiaPage({ lavertia, registry = defaultUiRegistry }: { lavertia: LavertiaPayload; registry?: UiRegistry }) {
    if (lavertia.version !== 1) {
        return <p role="alert" className="p-6 text-sm text-rose-700">Unsupported Lavertia protocol version.</p>;
    }

    const kitId = activeUiKitId(lavertia.uiKit);
    const Shell = registry.resolveShell(kitId) ?? DefaultPageShell;

    return (
        <UiRegistryProvider registry={registry} kitId={kitId}>
            <Head title={lavertia.title ?? 'Lavertia'} />
            <Shell lavertia={lavertia}>
                <LavertiaRenderer node={lavertia.tree} />
            </Shell>
        </UiRegistryProvider>
    );
}
