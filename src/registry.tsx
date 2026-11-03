import { createContext, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { isUiKitId } from '@lavertia/ui';
import type { ComponentNode } from '@lavertia/ui';

export interface UiComponentProps {
    node: ComponentNode;
    children: ReactNode;
}

export type UiComponent = ComponentType<UiComponentProps>;

export interface UiKitDefinition {
    id: string;
    components: Readonly<Record<string, UiComponent>>;
    /** Explicitly fall back to Lavertia's built-in renderer or fail on a missing component. */
    fallback: 'default' | 'error';
}

interface RegisteredKit {
    components: Map<string, UiComponent>;
    fallback: 'default' | 'error';
}

const componentIdPattern = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)?$/;

function assertComponentId(type: string): void {
    if (typeof type !== 'string' || !componentIdPattern.test(type)) {
        throw new Error('Invalid Lavertia component type: ' + String(type));
    }
}

/**
 * Registries are application-scoped. Import the built-in renderer by default,
 * then opt in to a UI Kit or override individual components without forking.
 */
export class UiRegistry {
    private readonly kits = new Map<string, RegisteredKit>([
        ['default', { components: new Map(), fallback: 'default' }],
    ]);

    private readonly globals = new Map<string, UiComponent>();
    private readonly overrides = new Map<string, UiComponent>();

    registerKit(kit: UiKitDefinition): this {
        if (!isUiKitId(kit.id) || this.kits.has(kit.id)) {
            throw new Error('Invalid or duplicate Lavertia UI Kit: ' + kit.id);
        }

        const components = new Map<string, UiComponent>();
        for (const [type, renderer] of Object.entries(kit.components)) {
            assertComponentId(type);
            if (!renderer) {
                throw new Error('Missing renderer for ' + type);
            }
            components.set(type, renderer);
        }

        if (kit.fallback !== 'default' && kit.fallback !== 'error') {
            throw new Error('Invalid fallback policy for UI Kit: ' + kit.id);
        }

        this.kits.set(kit.id, { components, fallback: kit.fallback });
        return this;
    }

    /** Register a plugin component, e.g. vendor.rating-input. */
    register(type: string, renderer: UiComponent): this {
        assertComponentId(type);
        if (!type.includes('.') || this.globals.has(type) || !renderer) {
            throw new Error('Plugin registrations require a unique vendor.component type.');
        }
        this.globals.set(type, renderer);
        return this;
    }

    /** Replace one component across all kits in this application. */
    override(type: string, renderer: UiComponent): this {
        assertComponentId(type);
        if (!renderer) {
            throw new Error('An override must provide a component renderer.');
        }
        this.overrides.set(type, renderer);
        return this;
    }

    hasKit(id: string): boolean {
        return this.kits.has(id);
    }

    resolve(type: string, kitId = 'default'): UiComponent | undefined {
        assertComponentId(type);
        const kit = this.kits.get(kitId);
        if (!kit) {
            throw new Error('Lavertia UI Kit "' + kitId + '" is not registered.');
        }

        const renderer = this.overrides.get(type)
            ?? kit.components.get(type)
            ?? this.globals.get(type);

        if (renderer) {
            return renderer;
        }

        if (kit.fallback === 'error') {
            throw new Error('UI Kit "' + kitId + '" does not implement ' + type);
        }

        return undefined;
    }
}

export function createUiRegistry(): UiRegistry {
    return new UiRegistry();
}

export const defaultUiRegistry = createUiRegistry();

interface UiContext {
    registry: UiRegistry;
    kitId: string;
}

const RegistryContext = createContext<UiContext | undefined>(undefined);

export function UiRegistryProvider({
    registry, kitId, children,
}: UiContext & { children: ReactNode }) {
    if (!registry.hasKit(kitId)) {
        throw new Error('Lavertia UI Kit "' + kitId + '" is not registered. Install and register it in the host app.');
    }

    return (
        <RegistryContext.Provider value={{ registry, kitId }}>
            {children}
        </RegistryContext.Provider>
    );
}

export function useUiRegistry(): UiContext {
    return useContext(RegistryContext) ?? { registry: defaultUiRegistry, kitId: 'default' };
}
