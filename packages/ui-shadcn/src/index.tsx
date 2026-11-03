import { useEffect, useState } from 'react';
import type { CSSProperties, ComponentType, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { themeVariables } from '@lavertia/ui';
import type { UiComponentProps, UiKitDefinition, UiShellProps } from '@lavertia/react-ui';

/**
 * Supply actual open-code shadcn primitives from your Laravel application.
 * The UI Kit does not bundle/fork shadcn components or import host "@/..." aliases.
 * That keeps ownership of primitives with the application, including RTL/styles.
 */
export interface ShadcnPrimitives {
    Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
    Label: ComponentType<LabelHTMLAttributes<HTMLLabelElement>>;
    Card: ComponentType<HTMLAttributes<HTMLDivElement>>;
    CardContent: ComponentType<HTMLAttributes<HTMLDivElement>>;
}

/** A small but real vertical slice: Page Shell, Card and Text Input. */
export function createShadcnKit(primitives: ShadcnPrimitives): UiKitDefinition {
    const { Input, Label, Card, CardContent } = primitives;

    function ShadcnTextInput({ node }: UiComponentProps) {
        const [value, setValue] = useState(String(node.props.value ?? ''));

        useEffect(() => {
            setValue(String(node.props.value ?? ''));
        }, [node.props.value]);

        const label = String(node.props.label ?? node.props.name ?? '');
        const help = typeof node.props.helperText === 'string' ? node.props.helperText : '';
        const name = String(node.props.name ?? '');

        return (
            <div className="grid min-w-0 gap-2">
                <Label htmlFor={node.key} className="text-sm font-medium">
                    {label}{node.props.required === true ? <span aria-hidden="true"> *</span> : null}
                </Label>
                <Input
                    id={node.key}
                    name={name}
                    type="text"
                    required={node.props.required === true}
                    disabled={node.props.disabled === true}
                    value={value}
                    placeholder={String(node.props.placeholder ?? '')}
                    aria-describedby={help ? node.key + '-help' : undefined}
                    onChange={(event) => setValue(event.currentTarget.value)}
                />
                {help && <p id={node.key + '-help'} className="text-muted-foreground text-xs">{help}</p>}
            </div>
        );
    }

    function ShadcnCard({ children }: UiComponentProps) {
        return (
            <Card className="min-w-0">
                <CardContent className="grid gap-4 p-5">{children}</CardContent>
            </Card>
        );
    }

    function ShadcnPageHeader({ node, children }: UiComponentProps) {
        const eyebrow = typeof node.props.eyebrow === 'string' ? node.props.eyebrow : '';
        const title = String(node.props.title ?? 'Overview');
        const description = typeof node.props.description === 'string' ? node.props.description : '';

        return (
            <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 space-y-1">
                    {eyebrow && <p className="text-primary text-xs font-semibold uppercase tracking-wide">{eyebrow}</p>}
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                    {description && <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>}
                </div>
                {children}
            </header>
        );
    }

    function ShadcnPageShell({ lavertia, children }: UiShellProps) {
        const navigation = lavertia.navigation ?? [];
        const lavertiaTokens = themeVariables(lavertia.theme);
        // The safe PHP theme is mapped into shadcn tokens only on this Page root.
        const style: Record<string, string> = { ...lavertiaTokens };
        const mappings: Record<string, string> = {
            '--lvt-primary': '--primary',
            '--lvt-primary-foreground': '--primary-foreground',
            '--lvt-ring': '--ring',
        };

        for (const [source, target] of Object.entries(mappings)) {
            if (lavertiaTokens[source]) {
                style[target] = lavertiaTokens[source];
            }
        }

        return (
            <main
                lang={lavertia.locale ?? 'en'}
                dir={lavertia.direction ?? 'ltr'}
                style={style as CSSProperties}
                className="lvt-root min-h-screen bg-background text-foreground"
            >
                <div className="mx-auto grid w-full max-w-screen-2xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:px-8">
                    {navigation.length > 0 && (
                        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
                            <Card className="overflow-hidden">
                                <CardContent className="p-2">
                                    <nav aria-label="Panel navigation">
                                        <ul className="grid gap-1">
                                            {navigation.map((item, index) => (
                                                <li key={item.slug}>
                                                    {item.group && (index === 0 || navigation[index - 1]?.group !== item.group) && (
                                                        <p className="text-muted-foreground px-3 pt-3 pb-1 text-xs font-semibold">{item.group}</p>
                                                    )}
                                                    <Link
                                                        href={item.url}
                                                        aria-current={item.active ? 'page' : undefined}
                                                        className={'block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
                                                            (item.active
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-foreground hover:bg-accent hover:text-accent-foreground')}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </CardContent>
                            </Card>
                        </aside>
                    )}
                    <div className={'min-w-0 space-y-6' + (navigation.length === 0 ? ' lg:col-span-2' : '')}>
                        {children}
                    </div>
                </div>
            </main>
        );
    }

    return {
        id: 'shadcn',
        shell: ShadcnPageShell,
        components: {
            'text-input': ShadcnTextInput,
            'card': ShadcnCard,
            'page-header': ShadcnPageHeader,
        },
        // The initial kit intentionally reuses tested default renderers
        // for Tables, Actions and fields not yet migrated to shadcn.
        fallback: 'default',
    };
}

export type { UiComponentProps, UiShellProps, ReactNode };
