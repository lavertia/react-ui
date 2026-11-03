import type {
    ButtonHTMLAttributes,
    ComponentType,
    HTMLAttributes,
    InputHTMLAttributes,
    LabelHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';

/** Application-owned, open-code shadcn UI primitives. No @/ path assumptions. */
export interface ShadcnCheckboxProps {
    id?: string;
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean | 'indeterminate') => void;
    'aria-describedby'?: string;
}

export interface ShadcnSelectControlProps {
    id: string;
    value: string;
    options: Readonly<Record<string, string>>;
    required: boolean;
    disabled: boolean;
    onValueChange: (value: string) => void;
}

export type ActionVariant = 'default' | 'outline' | 'secondary';

export interface ShadcnPrimitives {
    Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
    Label: ComponentType<LabelHTMLAttributes<HTMLLabelElement>>;
    Textarea: ComponentType<TextareaHTMLAttributes<HTMLTextAreaElement>>;
    Checkbox: ComponentType<ShadcnCheckboxProps>;
    Button: ComponentType<ButtonHTMLAttributes<HTMLButtonElement>>;
    Card: ComponentType<HTMLAttributes<HTMLDivElement>>;
    CardContent: ComponentType<HTMLAttributes<HTMLDivElement>>;
    /**
     * Optional adapter for shadcn Select's compound primitives (Radix or Base UI).
     * The fallback is an accessible semantic native select.
     */
    SelectControl?: ComponentType<ShadcnSelectControlProps>;
    /** Reuse the application's shadcn buttonVariants for Inertia links. */
    buttonClassName?: (variant: ActionVariant) => string;
}
