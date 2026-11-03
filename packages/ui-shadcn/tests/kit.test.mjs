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
    Textarea: primitive('textarea'),
    Button: primitive('button'),
    Checkbox: ({ checked, onCheckedChange, ...props }) => createElement('input', { ...props, type: 'checkbox', checked }),

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

test('new Shadcn controls preserve Laravel FormData field values', () => {
    const kit = createShadcnKit(inputs);
    for (const type of ['textarea', 'checkbox', 'select']) {
        assert.equal(typeof kit.components[type], 'function', type);
    }

    const textarea = renderToStaticMarkup(createElement(kit.components.textarea, {
        node: node('textarea', { name: 'bio', label: 'Bio', value: 'Hello', rows: 4, required: true }), children: null,
    }));
    assert.match(textarea, /name="bio"/);
    assert.match(textarea, /Hello/);
    assert.match(textarea, /required=""/);

    const checkbox = renderToStaticMarkup(createElement(kit.components.checkbox, {
        node: node('checkbox', { name: 'active', label: 'Active', checked: true }), children: null,
    }));
    assert.match(checkbox, /name="active"/);
    assert.match(checkbox, /value="1"/);
    assert.match(checkbox, /aria|type="checkbox"/);

    const select = renderToStaticMarkup(createElement(kit.components.select, {
        node: node('select', { name: 'role', label: 'Role', value: 'staff', options: { staff: 'Staff', admin: 'Admin' } }),
        children: null,
    }));
    assert.match(select, /name="role"/);
    assert.match(select, /Staff/);
    assert.match(select, /selected=""/);
});

test('SelectControl adapter supports compound shadcn selects without duplicate submitted names', () => {
    const compound = (props) => createElement('div', { 'data-select': props.value, id: props.id }, 'Compound shadcn select');
    const kit = createShadcnKit({ ...inputs, SelectControl: compound });
    const markup = renderToStaticMarkup(createElement(kit.components.select, {
        node: node('select', { name: 'role', value: 'admin', options: { admin: 'Admin' } }),
        children: null,
    }));
    assert.match(markup, /name="role"/);
    assert.match(markup, /value="admin"/);
    assert.match(markup, /Compound shadcn select/);
});

test('Shadcn forms reuse Lavertia Inertia submission and server validation lifecycle', () => {
    const kit = createShadcnKit(inputs);
    const Form = kit.components.form;
    const markup = renderToStaticMarkup(createElement(Form, {
        node: node('form', { name: 'users', label: 'Edit user', action: '/users', method: 'patch' }),
        children: createElement('input', { name: 'name', defaultValue: 'A' }),
    }));
    assert.match(markup, /<form/);
    assert.match(markup, /Edit user/);
    assert.match(markup, /type="submit"/);
    assert.match(markup, /name="name"/);
});

test('Shadcn actions reject unsafe URLs and render safe external links', () => {
    const kit = createShadcnKit(inputs);
    const Action = kit.components.action;
    const unsafe = renderToStaticMarkup(createElement(Action, {
        node: node('action', { href: 'javascript:alert(1)', label: 'Bad' }), children: null,
    }));
    assert.doesNotMatch(unsafe, /href=/);

    const safe = renderToStaticMarkup(createElement(Action, {
        node: node('action', { href: 'https://example.org', label: 'Visit' }), children: null,
    }));
    assert.match(safe, /href="https:\/\/example.org"/);
    assert.match(safe, /rel="noopener noreferrer"/);
});
