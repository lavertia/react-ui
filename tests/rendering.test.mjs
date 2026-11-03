import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LavertiaRenderer, createUiRegistry, UiRegistryProvider, DefaultPageShell } from '../dist/index.js';

const text = (key, content) => ({ type: 'text', key, props: { content }, components: [] });
const tree = (type, key, children = []) => ({ type, key, props: {}, components: children });

test('the default renderer still composes cards and independent text components', () => {
    const markup = renderToStaticMarkup(createElement(LavertiaRenderer, {
        node: tree('column', 'root', [tree('card', 'root/card', [text('root/card/title', 'Hello')])]),
    }));
    assert.match(markup, /Hello/);
    assert.match(markup, /<section/);
});

test('default field renderer preserves controlled input attributes and helper text', () => {
    const markup = renderToStaticMarkup(createElement(LavertiaRenderer, { node: {
        type: 'text-input', key: 'root/name', props: {
            name: 'name', label: 'Full name', required: true, value: 'Ada', helperText: 'Required',
        }, components: [],
    } }));
    assert.match(markup, /name="name"/);
    assert.match(markup, /value="Ada"/);
    assert.match(markup, /Required/);
});

test('a registered UI Kit overrides only selected components without forking PHP schema', () => {
    const custom = ({ node }) => createElement('div', { 'data-kit-field': node.key }, 'Custom kit input');
    const registry = createUiRegistry().registerKit({
        id: 'shadcn', components: { 'text-input': custom }, fallback: 'default',
    });
    const markup = renderToStaticMarkup(createElement(UiRegistryProvider, {
        registry, kitId: 'shadcn', children: createElement(LavertiaRenderer, { node: tree('column', 'root', [{
            type: 'text-input', key: 'root/field', props: { name: 'field' }, components: [],
        }, text('root/text', 'Preserved default text')]) }),
    }));
    assert.match(markup, /Custom kit input/);
    assert.match(markup, /Preserved default text/);
});

test('standalone Pages use the default shell without requiring navigation', () => {
    const markup = renderToStaticMarkup(createElement(DefaultPageShell, {
        lavertia: { version: 1, title: 'Public', tree: text('root', 'Hello'), direction: 'rtl', locale: 'ar' },
        children: createElement('p', null, 'Independent page'),
    }));
    assert.match(markup, /Independent page/);
    assert.match(markup, /dir="rtl"/);
    assert.doesNotMatch(markup, /Panel navigation/);
});
