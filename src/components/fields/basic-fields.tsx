import { useEffect, useState } from 'react';
import type { ComponentNode } from '@lavertia/ui';

/** Keep local field state isolated from parent Page/Section rendering. */
export function BasicFieldRenderer({ node }: { node: ComponentNode }) {
    const [input, setInput] = useState(String(node.props.value ?? ''));
    const [checked, setChecked] = useState(node.props.checked === true);

    useEffect(() => {
        setInput(String(node.props.value ?? ''));
    }, [node.props.value]);

    switch (node.type) {
case 'select':
            return <label className="flex flex-col gap-1.5 text-sm font-semibold">
                {String(node.props.label ?? node.props.name ?? '')}
                <select name={String(node.props.name ?? '')} value={input} required={node.props.required === true} onChange={(event) => setInput(event.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal dark:border-white/20 dark:bg-gray-950">
                    <option value="">—</option>
                    {Object.entries(node.props.options && typeof node.props.options === 'object' ? node.props.options as Record<string, string> : {}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </label>;

        case 'textarea':
            return <label className="flex flex-col gap-1.5 text-sm font-semibold">
                {String(node.props.label ?? node.props.name ?? '')}
                <textarea name={String(node.props.name ?? '')} required={node.props.required === true} rows={Number(node.props.rows ?? 3)} value={input} onChange={(event) => setInput(event.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-normal dark:border-white/20 dark:bg-gray-950" />
            </label>;

        case 'checkbox':
            return <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="hidden" name={String(node.props.name ?? '')} value="0" />
                <input type="checkbox" name={String(node.props.name ?? '')} value="1" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
                {String(node.props.label ?? node.props.name ?? '')}
            </label>;

                case 'text-input':
            return (
                <div className="flex min-w-0 flex-col gap-1.5">
                    <label htmlFor={node.key} className="text-sm font-semibold text-gray-800 dark:text-gray-200">{String(node.props.label ?? node.props.name ?? '')}</label>
                    <input
                        id={node.key}
                        name={String(node.props.name ?? '')}
                        type="text"
                        required={node.props.required === true}
                        value={input}
                        placeholder={String(node.props.placeholder ?? '')}
                        onChange={(event) => setInput(event.target.value)}
                        aria-describedby={node.props.helperText ? node.key + '-help' : undefined}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 lvt-input dark:border-white/20 dark:bg-gray-950 dark:text-gray-100"
                    />
                    {typeof node.props.helperText === 'string' && node.props.helperText.length > 0 && <p id={node.key + '-help'} className="text-xs text-gray-500 dark:text-gray-400">{String(node.props.helperText)}</p>}
                </div>
            );
        default:
            return null;
    }
}
