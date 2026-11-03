import assert from 'node:assert/strict';
import test from 'node:test';
import { createUiRegistry } from '@lavertia/react-ui/registry';

const custom = () => null;
const other = () => null;

test('built-in UI is the default; registered kits can replace selected components', () => {
    const registry = createUiRegistry().registerKit({
        id: 'shadcn',
        components: { 'text-input': custom },
        fallback: 'default',
    });
    assert.equal(registry.hasKit('default'), true);
    assert.equal(registry.hasKit('shadcn'), true);
    assert.equal(registry.resolve('text-input', 'shadcn'), custom);
    assert.equal(registry.resolve('card', 'shadcn'), undefined);
    assert.equal(registry.resolve('card', 'default'), undefined);
});

test('app overrides outrank kit mappings; plugins can register vendor components', () => {
    const registry = createUiRegistry()
        .registerKit({ id: 'shadcn', components: { 'text-input': custom }, fallback: 'error' })
        .register('vendor.rating-input', custom)
        .override('text-input', other);

    assert.equal(registry.resolve('text-input', 'shadcn'), other);
    assert.equal(registry.resolve('vendor.rating-input', 'shadcn'), custom);
    assert.throws(() => registry.resolve('card', 'shadcn'), /does not implement/);
    assert.throws(() => registry.register('text-input', custom), /unique vendor.component/);
});

test('invalid kits, collisions and missing kits fail before rendering', () => {
    const registry = createUiRegistry();
    assert.throws(() => registry.resolve('text', 'missing'), /not registered/);
    assert.throws(() => registry.registerKit({ id: '../bad', components: {}, fallback: 'error' }), /Invalid or duplicate/);
    assert.throws(() => registry.registerKit({ id: 'default', components: {}, fallback: 'error' }), /Invalid or duplicate/);
    assert.throws(() => registry.registerKit({ id: 'test', components: { 'bad/type': custom }, fallback: 'default' }), /Invalid Lavertia component/);
    assert.throws(() => registry.register('vendor.forms.rating', custom), /Invalid Lavertia component/);
});

test('a UI Kit can supply an independent Page shell', () => {
    const shell = () => null;
    const registry = createUiRegistry().registerKit({
        id: 'marketing', shell, components: {}, fallback: 'default',
    });
    assert.equal(registry.resolveShell('marketing'), shell);
    assert.equal(registry.resolveShell('default'), undefined);
    assert.throws(() => registry.resolveShell('unknown'), /not registered/);
});
