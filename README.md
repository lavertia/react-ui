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

## UI customization

Edit `src/renderer.tsx` for component behavior or styling and `src/page.tsx` for the shell. Never edit `playground` as an upstream UI source. Code should eventually be split into component files by feature once the adapter extraction is stable.
