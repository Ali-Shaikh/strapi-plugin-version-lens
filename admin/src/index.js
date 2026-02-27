'use strict';

const pluginId = 'version-lens';
const pluginName = 'Version Lens';
const VersionLensIcon = require('./components/VersionLensIcon');

module.exports = {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      name: pluginName,
      icon: VersionLensIcon,
    });
  },

  bootstrap(app) {
    app.addSettingsLink('global', {
      intlLabel: {
        id: `${pluginId}.settings.title`,
        defaultMessage: pluginName,
      },
      id: pluginId,
      to: pluginId,
      icon: VersionLensIcon,
      Component: async () => {
        const component = await import('./pages/VersionSettingsPage.jsx');
        return component.default;
      },
      permissions: [],
    });
  },

  async registerTrads() {
    return [];
  },
};
