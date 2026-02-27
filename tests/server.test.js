'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const plugin = require('../server/src');

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const restoreEnv = (snapshot) => {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(snapshot)) {
    process.env[key] = value;
  }
};

const withTempProject = async ({ packageJson, strapiPackageJson }, callback) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-lens-plugin-'));
  const cwdSnapshot = process.cwd();
  const envSnapshot = { ...process.env };

  try {
    writeJson(path.join(tempDir, 'package.json'), packageJson);

    if (strapiPackageJson) {
      writeJson(path.join(tempDir, 'node_modules/@strapi/strapi/package.json'), strapiPackageJson);
    }

    process.chdir(tempDir);
    await callback();
  } finally {
    process.chdir(cwdSnapshot);
    restoreEnv(envSnapshot);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

test('registers an admin route and returns app metadata payload', async () => {
  await withTempProject(
    {
      packageJson: {
        name: 'host-app',
        version: '2.5.0',
        description: 'Host application',
        dependencies: {
          '@strapi/strapi': '^5.0.0',
        },
      },
      strapiPackageJson: {
        version: '5.37.1',
      },
    },
    async () => {
      process.env.NODE_ENV = 'production';
      process.env.GIT_COMMIT_SHA = 'abc123';
      process.env.BUILD_DATE = '2026-02-27T00:00:00.000Z';

      let routeConfig;

      const strapi = {
        config: {
          get(key, fallback) {
            if (key === 'plugin::version-lens') {
              return {
                commitShaEnvKeys: ['GIT_COMMIT_SHA'],
                buildDateEnvKeys: ['BUILD_DATE'],
              };
            }

            return fallback;
          },
        },
        server: {
          routes(payload) {
            routeConfig = payload;
          },
        },
      };

      plugin.bootstrap({ strapi });

      assert.equal(routeConfig.type, 'admin');
      assert.equal(routeConfig.prefix, '/version-lens');
      assert.equal(routeConfig.routes.length, 1);

      const route = routeConfig.routes[0];
      assert.equal(route.method, 'GET');
      assert.equal(route.path, '/info');
      assert.equal(typeof route.handler, 'function');
      assert.deepEqual(route.config, { auth: { scope: [] } });

      const ctx = {};
      route.handler(ctx);

      assert.equal(ctx.body.name, 'host-app');
      assert.equal(ctx.body.version, '2.5.0');
      assert.equal(ctx.body.description, 'Host application');
      assert.equal(ctx.body.strapiVersion, '5.37.1');
      assert.equal(ctx.body.nodeVersion, process.version);
      assert.equal(ctx.body.environment, 'production');
      assert.equal(ctx.body.commitSha, 'abc123');
      assert.equal(ctx.body.buildDate, '2026-02-27T00:00:00.000Z');
      assert.ok(!Number.isNaN(Date.parse(ctx.body.generatedAt)));
    }
  );
});

test('falls back to dependency version and default env key lists', async () => {
  await withTempProject(
    {
      packageJson: {
        name: 'fallback-app',
        version: '0.9.1',
        dependencies: {
          '@strapi/strapi': '^5.12.0',
        },
      },
    },
    async () => {
      process.env.VERCEL_GIT_COMMIT_SHA = 'vercelsha';
      process.env.CI_BUILD_DATE = '2026-02-26T10:00:00.000Z';
      delete process.env.BUILD_DATE;
      delete process.env.GIT_COMMIT_SHA;
      delete process.env.CI_COMMIT_SHA;

      let routeConfig;

      const strapi = {
        config: {
          get() {
            return {};
          },
        },
        server: {
          routes(payload) {
            routeConfig = payload;
          },
        },
      };

      plugin.bootstrap({ strapi });

      const ctx = {};
      routeConfig.routes[0].handler(ctx);

      assert.equal(ctx.body.name, 'fallback-app');
      assert.equal(ctx.body.version, '0.9.1');
      assert.equal(ctx.body.strapiVersion, '^5.12.0');
      assert.equal(ctx.body.commitSha, 'vercelsha');
      assert.equal(ctx.body.buildDate, '2026-02-26T10:00:00.000Z');
    }
  );
});

test('supports legacy release-radar config key for compatibility', async () => {
  await withTempProject(
    {
      packageJson: {
        name: 'legacy-app',
        version: '1.0.0',
        dependencies: {
          '@strapi/strapi': '^5.0.0',
        },
      },
    },
    async () => {
      process.env.LEGACY_SHA = 'legacysha';
      process.env.LEGACY_DATE = '2026-02-24T10:00:00.000Z';

      let routeConfig;

      const strapi = {
        config: {
          get(key, fallback) {
            if (key === 'plugin::version-lens') {
              return {};
            }

            if (key === 'plugin::release-radar') {
              return {};
            }

            if (key === 'plugin::version-settings') {
              return {
                commitShaEnvKeys: ['LEGACY_SHA'],
                buildDateEnvKeys: ['LEGACY_DATE'],
              };
            }

            return fallback;
          },
        },
        server: {
          routes(payload) {
            routeConfig = payload;
          },
        },
      };

      plugin.bootstrap({ strapi });

      const ctx = {};
      routeConfig.routes[0].handler(ctx);

      assert.equal(ctx.body.commitSha, 'legacysha');
      assert.equal(ctx.body.buildDate, '2026-02-24T10:00:00.000Z');
    }
  );
});

test('supports legacy version-settings config key for compatibility', async () => {
  await withTempProject(
    {
      packageJson: {
        name: 'legacy-settings-app',
        version: '1.0.0',
        dependencies: {
          '@strapi/strapi': '^5.0.0',
        },
      },
    },
    async () => {
      process.env.LEGACY_SETTINGS_SHA = 'legacysettingssha';
      process.env.LEGACY_SETTINGS_DATE = '2026-02-25T10:00:00.000Z';

      let routeConfig;

      const strapi = {
        config: {
          get(key, fallback) {
            if (key === 'plugin::version-lens') {
              return {};
            }

            if (key === 'plugin::release-radar') {
              return {};
            }

            if (key === 'plugin::version-settings') {
              return {
                commitShaEnvKeys: ['LEGACY_SETTINGS_SHA'],
                buildDateEnvKeys: ['LEGACY_SETTINGS_DATE'],
              };
            }

            return fallback;
          },
        },
        server: {
          routes(payload) {
            routeConfig = payload;
          },
        },
      };

      plugin.bootstrap({ strapi });

      const ctx = {};
      routeConfig.routes[0].handler(ctx);

      assert.equal(ctx.body.commitSha, 'legacysettingssha');
      assert.equal(ctx.body.buildDate, '2026-02-25T10:00:00.000Z');
    }
  );
});
