# @lavertia/react-ui

Production React renderer of Lavertia component protocol v1. This repo owns **all React UI rendering**, including Forms, Tables, Actions, Infolists, layouts and dashboard widgets. The playground is only a demo consumer.

The shared `@lavertia/ui` package owns protocol types, table helpers and theme token validation. `lavertia/panels` owns PHP components, Eloquent/authorization, and optional installer shims, **not UI markup**.

## Development installation

```sh
npm install github:lavertia/react-ui#main
```

Development Git installs resolve a sibling dependency on `github:lavertia/ui#main`. Commit-pin the Git refs for reproducible deployments. These packages are alpha, not yet published to npm.

## Theme support

The framework Page imports `@lavertia/ui/theme.css` and consumes the server-provided `lavertia.theme` tokens on a root `lvt-root` wrapper. CSS is scoped to Lavertia and safely overrides semantic controls, navigation, accents and focus rings without recompiling Tailwind.

Configure the PHP theme on the Panel by registering `\Lavertia\ThemeDefault\ClassicTheme::class` in `config/lavertia.php` once the Composer `lavertia/theme-default` package is installed.

## Custom UI Kits, plugin components and local overrides

`@lavertia/react-ui` now exports `createUiRegistry` and accepts a `registry` prop on `LavertiaPage`. **You do not need to fork the renderer to customize a field or shell.** Each kit can implement some or all component types; declare its fallback explicitly (`default` or `error`). The built-in renderer remains selected by `lavertia.uiKit.id = default`.

```tsx
import { LavertiaPage, createUiRegistry } from '@lavertia/react-ui';
import type { LavertiaPayload } from '@lavertia/ui';
import { CardRenderer, RatingRenderer, ShadcnInputRenderer } from '@/components/lavertia';

const registry = createUiRegistry()
    .registerKit({
        id: 'shadcn',
        components: { 'text-input': ShadcnInputRenderer },
        fallback: 'default',
    })
    .register('app.rating-input', RatingRenderer)
    .override('card', CardRenderer);

export default function Page({ lavertia }: { lavertia: LavertiaPayload }) {
    return <LavertiaPage lavertia={lavertia} registry={registry} />;
}
```

The imported `@/components/lavertia` components are **application-owned examples**, not shipped modules. Replace the generated `resources/js/pages/lavertia/page.tsx` shim with this host wrapper (do not rerun the installer with `--force` over a customized file). The configured PHP Kit ID must exactly match a registered ID; unregistered kits fail with an actionable error. This does not automatically install shadcn/UI components or provide a complete shadcn kit yet.

Resolution priority: application-wide `override()` → selected kit components → custom `register(vendor.component)` → built-in renderer if the kit declares `fallback: default`. `fallback: error` rejects missing component types. `register()` refuses built-in names (use `override()` for those); avoid passing callbacks through Inertia props.

A kit may also provide a full Page shell:

```tsx
registerKit({
    id: 'marketing',
    shell: MarketingShell,
    components: { 'text-input': MarketingInput },
    fallback: 'default',
});
```

The default shell is exported as `DefaultPageShell`, and stable default renderers are exported as `FormRenderer`, `TablePreview`, `BasicFieldRenderer` and `ActionLink`. These are owned by `@lavertia/react-ui`, not copied into host applications. Page shell switching is kit-scoped; no app-specific CSS/build is loaded dynamically from server IDs.

The registry is application-scoped and should be built once at module scope. Future work includes per-scope registries, Vue/Svelte parity, component manifest checks, a clean default shadcn kit and splitting the monolithic fallback renderer. Never edit `playground` as an upstream UI source.

