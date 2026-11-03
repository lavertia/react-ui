import { useEffect, useState } from 'react';
import type { UiComponent, UiComponentProps } from '@lavertia/react-ui';
import type { ShadcnPrimitives } from './primitives.js';

/** Real field implementations; retains FormData-compatible names and required flags. */
export function createShadcnFields({ Input, Label, Textarea, Checkbox, SelectControl }: ShadcnPrimitives): Record<string, UiComponent> {
    function TextField({ node }: UiComponentProps) {
        const [value, setValue] = useState(String(node.props.value ?? ''));
        useEffect(() => setValue(String(node.props.value ?? '')), [node.props.value]);
        const label = String(node.props.label ?? node.props.name ?? '');
        const help = typeof node.props.helperText === 'string' ? node.props.helperText : '';
        return (
            <div className="grid min-w-0 gap-2">
                <Label htmlFor={node.key} className="text-sm font-medium">{label}</Label>
                <Input
                    id={node.key}
                    name={String(node.props.name ?? '')}
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

    function TextareaField({ node }: UiComponentProps) {
        const [value, setValue] = useState(String(node.props.value ?? ''));
        useEffect(() => setValue(String(node.props.value ?? '')), [node.props.value]);
        const help = typeof node.props.helperText === 'string' ? node.props.helperText : '';
        return (
            <div className="grid min-w-0 gap-2">
                <Label htmlFor={node.key} className="text-sm font-medium">{String(node.props.label ?? node.props.name ?? '')}</Label>
                <Textarea
                    id={node.key}
                    name={String(node.props.name ?? '')}
                    required={node.props.required === true}
                    disabled={node.props.disabled === true}
                    rows={typeof node.props.rows === 'number' ? node.props.rows : 3}
                    value={value}
                    aria-describedby={help ? node.key + '-help' : undefined}
                    onChange={(event) => setValue(event.currentTarget.value)}
                />
                {help && <p id={node.key + '-help'} className="text-muted-foreground text-xs">{help}</p>}
            </div>
        );
    }

    function CheckboxField({ node }: UiComponentProps) {
        const [checked, setChecked] = useState(node.props.checked === true);
        useEffect(() => setChecked(node.props.checked === true), [node.props.checked]);
        const name = String(node.props.name ?? '');
        const help = typeof node.props.helperText === 'string' ? node.props.helperText : '';
        return (
            <div className="grid gap-1.5">
                <div className="flex items-center gap-2">
                    {/* Own the submitted value; Radix/Base UI internals never duplicate the name. */}
                    <input type="hidden" name={name} value={checked ? '1' : '0'} />
                    <Checkbox
                        id={node.key}
                        checked={checked}
                        disabled={node.props.disabled === true}
                        aria-describedby={help ? node.key + '-help' : undefined}
                        onCheckedChange={(value) => setChecked(value === true)}
                    />
                    <Label htmlFor={node.key}>{String(node.props.label ?? name)}</Label>
                </div>
                {help && <p id={node.key + '-help'} className="text-muted-foreground text-xs">{help}</p>}
            </div>
        );
    }

    function SelectField({ node }: UiComponentProps) {
        const [value, setValue] = useState(String(node.props.value ?? ''));
        useEffect(() => setValue(String(node.props.value ?? '')), [node.props.value]);
        const name = String(node.props.name ?? '');
        const raw = node.props.options;
        const options: Record<string, string> = raw !== null && typeof raw === 'object'
            ? Object.fromEntries(Object.entries(raw).filter(([, item]) => typeof item === 'string')) as Record<string, string>
            : {};
        const required = node.props.required === true;
        const disabled = node.props.disabled === true;
        const help = typeof node.props.helperText === 'string' ? node.props.helperText : '';
        return (
            <div className="grid min-w-0 gap-2">
                <Label htmlFor={node.key}>{String(node.props.label ?? name)}</Label>
                {SelectControl ? (
                    <>
                        <input type="hidden" name={name} value={disabled ? '' : value} disabled={disabled} />
                        <SelectControl
                            id={node.key}
                            value={value}
                            options={options}
                            required={required}
                            disabled={disabled}
                            onValueChange={setValue}
                        />
                    </>
                ) : (
                    <select
                        id={node.key}
                        name={name}
                        value={value}
                        required={required}
                        disabled={disabled}
                        onChange={(event) => setValue(event.currentTarget.value)}
                        aria-describedby={help ? node.key + '-help' : undefined}
                        className="border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <option value="">—</option>
                        {Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
                    </select>
                )}
                {help && <p id={node.key + '-help'} className="text-muted-foreground text-xs">{help}</p>}
            </div>
        );
    }

    return {
        'text-input': TextField,
        textarea: TextareaField,
        checkbox: CheckboxField,
        select: SelectField,
    };
}
