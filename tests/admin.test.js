'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const adminPlugin = require('../admin/src');

test('registers plugin metadata and settings link for admin UI', async () => {
  let pluginPayload;
  let settingsSection;
  let settingsPayload;

  const app = {
    registerPlugin(payload) {
      pluginPayload = payload;
    },
    addSettingsLink(section, payload) {
      settingsSection = section;
      settingsPayload = payload;
    },
  };

  adminPlugin.register(app);
  adminPlugin.bootstrap(app);

  assert.deepEqual(pluginPayload, {
    id: 'version-lens',
    name: 'Version Lens',
  });

  assert.equal(settingsSection, 'global');
  assert.equal(settingsPayload.id, 'version-lens');
  assert.equal(settingsPayload.to, 'version-lens');
  assert.equal(settingsPayload.intlLabel.id, 'version-lens.settings.title');
  assert.equal(settingsPayload.intlLabel.defaultMessage, 'Version Lens');
  assert.equal(typeof settingsPayload.icon, 'function');
  assert.equal(typeof settingsPayload.Component, 'function');
  assert.deepEqual(settingsPayload.permissions, []);
});

test('returns no translations by default', async () => {
  const translations = await adminPlugin.registerTrads();
  assert.deepEqual(translations, []);
});
