import { Link } from '@inertiajs/react';
import { themeVariables } from '@lavertia/ui';
import type { LavertiaPayload } from '@lavertia/ui';
import type { CSSProperties, ReactNode } from 'react';

/** Default presentation, not a mandatory Panel dependency. */
export function DefaultPageShell({ lavertia, children }: { lavertia: LavertiaPayload; children: ReactNode }) {
    const navigation = lavertia.navigation ?? [];

    return (
            <main lang={lavertia.locale ?? 'en'} dir={lavertia.direction ?? 'ltr'} style={themeVariables(lavertia.theme) as CSSProperties} className="lvt-root min-h-[calc(100vh-8rem)] bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8 dark:bg-gray-950/40">
                <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 lg:flex-row">
                    {navigation.length > 0 && (
                        <aside className="w-full shrink-0 lg:w-60">
                            <nav aria-label="Panel navigation" className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-gray-900/70">
                                <ul className="space-y-1">
                                    {navigation.map((item, index) => (
                                        <li key={item.slug}>
                                            {item.group && (index === 0 || navigation[index - 1]?.group !== item.group) && (
                                                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.group}</p>
                                            )}
                                            <Link
                                                href={item.url}
                                                aria-current={item.active ? 'page' : undefined}
                                                className={`block rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 lvt-focus ${item.active
                                                    ? 'lvt-nav-active'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}`}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </aside>
                    )}
                    <div className="min-w-0 flex-1">
                        {children}
                    </div>
                </div>
            </main>
    );
}
