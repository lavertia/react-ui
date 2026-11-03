import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createShadcnKit } from '../dist/index.js';

const primitive = (tag) => ({ children, ...props }) => createElement(tag, props, children);
const inputs = {
    Input: primitive('input'),
    Label: primitive('label'),
    Card: primitive('section'),
    CardContent: primitive('div'),
};
const node = (type, props = {}) => ({ type, key: 'root/name', props, components: [] });

test('Shadcn kit maps real application-provided UI primitives to Lavertia component types', () => {
    const kit = createShadcnKit(inputs);
    assert.equal(kit.id, 'shadcn');
    assert.equal(kit.fallback, 'default');
    assert.equal(typeof kit.components['text-input'], 'function');
    assert.equal(typeof kit.components['card'], 'function');
    assert.equal(typeof kit.shell, 'function');
});

test('Shadcn TextInput keeps FormData-compatible name and accessible helper text', () => {
    const kit = createShadcnKit(inputs);
    const Input = kit.components['text-input'];
    const markup = renderToStaticMarkup(createElement(Input, {
        node: node('text-input', { name: 'name', label: 'Full name', value: 'Ada', required: true, helperText: 'Required field' }),
        children: null,
    }));
    assert.match(markup, /name="name"/);
    assert.match(markup, /value="Ada"/);
    assert.match(markup, /Required field/);
    assert.match(markup, /aria-describedby="root\/name-help"/);
});

test('Shadcn Card composes descendants without depending on a Panel', () => {
    const kit = createShadcnKit(inputs);
    const Card = kit.components.card;
    const markup = renderToStaticMarkup(createElement(Card, {
        node: node('card'), children: createElement('p', null, 'Independent landing section'),
    }));
    assert.match(markup, /Independent landing section/);
    assert.match(markup, /<section/);
});

test('Shadcn shell honors server locale/RTL and bridges validated theme tokens', () => {
    const kit = createShadcnKit(inputs);
    const Shell = kit.shell;
    const markup = renderToStaticMarkup(createElement(Shell, {
        lavertia: {
            version: 1,
            locale: 'ar',
            direction: 'rtl',
            tree: node('text'),
            theme: { id: 'demo', tokens: { primary: '#123456', ring: '#234567' } },
        },
        children: createElement('p', null, 'Arabic page'),
    }));
    assert.match(markup, /dir="rtl"/);
    assert.match(markup, /--primary:#123456/);
    assert.match(markup, /Arabic page/);
    assert.doesNotMatch(markup, /Panel navigation/);
});
