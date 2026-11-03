# @lavertia/ui-shadcn — portable prototype

**Status: P1 proof-of-concept, not a complete UI Kit or a published npm package.**

This is an independent npm package staged under `lavertia/react-ui/packages/ui-shadcn` because `lavertia/ui-shadcn` is not yet an accessible GitHub repository. It has its **own `package.json`, TypeScript build, tests and API**, and can be moved to the dedicated repository without changing the Lavertia Component Protocol or core packages.

## Design contract

- `@lavertia/react-ui` owns renderer selection and UI Registry; it does not import this package.
- `@lavertia/ui` owns component protocol and validated theme tokens.
- The Laravel app owns the actual shadcn **open-code** primitives (following shadcn's own philosophy).
- This adapter receives the components by dependency injection. It never accesses host `@/` aliases from `node_modules` and never bundles shadcn vendor source.
- `createShadcnKit()` returns an ordinary `UiKitDefinition`, with a separate full-page Shell, Cards, Form, TextInput, Textarea, Checkbox, Select, PageHeader and navigation Actions. The Table, advanced inputs and other unavailable components explicitly reuse the default tested renderer.

## Laravel React Starter Kit usage

Use an already configured Laravel React/Inertia Starter Kit. To install its shadcn primitives, follow the [official Laravel shadcn guide](https://ui.shadcn.com/docs/installation/laravel):

```sh
npx shadcn@latest init
npx shadcn@latest add card input label textarea checkbox button
```

While this prototype lives in a nested Git repository package:

```sh
git clone https://github.com/lavertia/react-ui.git ../lavertia-react-ui
cd ../lavertia-react-ui/packages/ui-shadcn
npm install
npm run build
cd -
npm install ../lavertia-react-ui/packages/ui-shadcn
```

In the host Laravel project, replace the tiny generated `resources/js/pages/lavertia/page.tsx` shim with this application-owned adapter:

```tsx
import { LavertiaPage, createUiRegistry } from '@lavertia/react-ui';
import { createShadcnKit } from '@lavertia/ui-shadcn';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { LavertiaPayload } from '@lavertia/ui';

const registry = createUiRegistry().registerKit(createShadcnKit({
    Input, Label, Textarea, Checkbox, Button, Card, CardContent,
}));

export default function Page({ lavertia }: { lavertia: LavertiaPayload }) {
    return <LavertiaPage lavertia={lavertia} registry={registry} />;
}
```

Then configure the PHP application default in `config/lavertia.php`:

```php
'ui' => [
    'kit' => 'shadcn',
    'theme' => null,
],
```

On Tailwind CSS 4 add a safe package-specific source directive to `resources/css/app.css` as needed:

```css
@source "../../node_modules/@lavertia/ui-shadcn/dist";
```

Run `npm run build`; **do not** use `php artisan lavertia:install --force` over your customized entry file.

## Future work

- Move to dedicated `lavertia/ui-shadcn` repository and tag immutable npm versions.
- Complete a native shadcn Table renderer, dialog primitives, advanced field adapters and visual/accessibility QA.
- Add install-time Kit selection and automatic registry scaffolding when packages are stable.
- Add standalone Marketing/Auth presets and navigation variants without assuming Panels.

## Select adapter and link styles

The kit supports `SelectControl` as an **optional application-supplied adapter**. Shadcn's Radix and Base UI Select controls are compound components, not HTML `<select>` elements. Without an adapter, the kit renders a styled, accessible native `<select>` that submits normally. An adapter receives `id`, `value`, `options`, `required`, `disabled`, and `onValueChange`; the kit submits its state through exactly one hidden `name=value` input. **Ensure the visual control supports keyboard and focus handling in the host.**

For links, optionally pass `buttonClassName: (variant) => buttonVariants({ variant })` from the host application's shadcn button utilities; using an `asChild` prop is intentionally avoided so both shadcn primitive families can work with Inertia's `Link`.

The Form uses Lavertia's shared `useFormSubmission` hook for POST/PUT/PATCH and Laravel validation feedback. React UI and Shadcn Kit must be installed from compatible revisions. Client validation and hidden buttons are never a substitute for backend Policies, CSRF and tenant-scoped queries.
