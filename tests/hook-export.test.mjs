import assert from 'node:assert/strict';
import test from 'node:test';
import { useFormSubmission } from '@lavertia/react-ui/form-submission';

test('CSS-free form hook is exported for server-side UI Kit rendering', () => {
    assert.equal(typeof useFormSubmission, 'function');
});
