'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const pkg = require('../package.json');

test('sdk export map points to source and dist entrypoints', async () => {
  assert.equal(pkg.main, './dist/server/index.js');

  assert.deepEqual(pkg.exports['./strapi-admin'], {
    source: './admin/src/index.js',
    import: './dist/admin/index.mjs',
    require: './dist/admin/index.js',
    default: './dist/admin/index.js',
  });

  assert.deepEqual(pkg.exports['./strapi-server'], {
    source: './server/src/index.js',
    import: './dist/server/index.mjs',
    require: './dist/server/index.js',
    default: './dist/server/index.js',
  });
});

test('source entrypoints remain loadable for local tests', async () => {
  const admin = require('../admin/src');
  const server = require('../server/src');

  assert.equal(typeof admin.register, 'function');
  assert.equal(typeof admin.bootstrap, 'function');
  assert.equal(typeof server.bootstrap, 'function');
});
