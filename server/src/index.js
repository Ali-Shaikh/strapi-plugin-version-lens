'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_COMMIT_SHA_ENV_KEYS = [
  'GIT_COMMIT_SHA',
  'CI_COMMIT_SHA',
  'VERCEL_GIT_COMMIT_SHA',
];

const DEFAULT_BUILD_DATE_ENV_KEYS = ['BUILD_DATE', 'CI_BUILD_DATE', 'VERCEL_BUILD_DATE'];
const PRIMARY_PLUGIN_CONFIG_KEY = 'plugin::version-lens';
const LEGACY_PLUGIN_CONFIG_KEYS = ['plugin::release-radar', 'plugin::version-settings'];

const readPackageJson = () => {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(content);
};

const getPluginConfig = (strapi) => {
  const primaryConfig = strapi.config.get(PRIMARY_PLUGIN_CONFIG_KEY, {});
  const legacyConfig = LEGACY_PLUGIN_CONFIG_KEYS.reduce((acc, key) => {
    return {
      ...acc,
      ...strapi.config.get(key, {}),
    };
  }, {});

  return {
    ...legacyConfig,
    ...primaryConfig,
  };
};

const getStrapiVersion = (pkg) => {
  try {
    const strapiPkgPath = path.resolve(process.cwd(), 'node_modules/@strapi/strapi/package.json');
    const strapiPkg = JSON.parse(fs.readFileSync(strapiPkgPath, 'utf8'));
    return strapiPkg.version || pkg.dependencies?.['@strapi/strapi'] || 'unknown';
  } catch {
    return pkg.dependencies?.['@strapi/strapi'] || 'unknown';
  }
};

const firstEnvValue = (keys) => {
  if (!Array.isArray(keys)) return null;
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
  }
  return null;
};

const getAppInfo = (strapi) => {
  const pkg = readPackageJson();
  const pluginConfig = getPluginConfig(strapi);

  const commitShaEnvKeys = pluginConfig.commitShaEnvKeys || DEFAULT_COMMIT_SHA_ENV_KEYS;
  const buildDateEnvKeys = pluginConfig.buildDateEnvKeys || DEFAULT_BUILD_DATE_ENV_KEYS;

  return {
    version: pkg.version || '0.0.0',
    name: pkg.name || 'unknown',
    description: pkg.description || '',
    strapiVersion: getStrapiVersion(pkg),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    commitSha: firstEnvValue(commitShaEnvKeys),
    buildDate: firstEnvValue(buildDateEnvKeys),
    generatedAt: new Date().toISOString(),
  };
};

module.exports = {
  bootstrap({ strapi }) {
    strapi.server.routes({
      type: 'admin',
      prefix: '/version-lens',
      routes: [
        {
          method: 'GET',
          path: '/info',
          handler: (ctx) => {
            ctx.body = getAppInfo(strapi);
          },
          config: {
            auth: {
              scope: [],
            },
          },
        },
      ],
    });
  },
};
