import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useTableState } from '@lavertia/react-ui/table-state';

const column = (name, sortable = false) => ({
    type: 'text-column', key: 'root/' + name, props: {
        name, label: name, sortable, searchable: true, toggleable: true,
    }, components: [],
});

const table = (mode) => ({
    type: 'table', key: 'root/table', props: {
        name: 'members', mode, rows: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
        pagination: { page: 2, lastPage: 9, total: 18, nextUrl: '/members?page=3' },
    }, components: [column('name', true)],
});

function Probe({ node }) {
    const state = useTableState(node);
    return createElement('output', {
        'data-mode': state.mode,
        'data-page': state.currentPage,
        'data-last': state.lastPage,
        'data-records': state.pageRows.length,
        'data-columns': state.visibleColumns.length,
    });
}

test('table state hook is CSS-free and usable from independent UI Kits', () => {
    assert.equal(typeof useTableState, 'function');
    const html = renderToStaticMarkup(createElement(Probe, { node: table('snapshot') }));
    assert.match(html, /data-mode="snapshot"/);
    assert.match(html, /data-records="2"/);
    assert.match(html, /data-page="1"/);
});

test('Eloquent mode preserves server pagination rather than slicing raw rows on the client', () => {
    const html = renderToStaticMarkup(createElement(Probe, { node: table('eloquent') }));
    assert.match(html, /data-mode="eloquent"/);
    assert.match(html, /data-page="2"/);
    assert.match(html, /data-last="9"/);
    assert.match(html, /data-records="2"/);
});
