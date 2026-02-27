# strapi-plugin-version-lens

Version Lens is a Strapi v5 plugin that adds a branded **Version Lens** page in Admin Settings for runtime and build metadata visibility.

## Features

- Settings menu entry: `Settings -> Global -> Version Lens`
- Admin-only endpoint: `GET /version-lens/info`
- Metadata fields:
  - app version, name, and description (from host app `package.json`)
  - Strapi version
  - Node version
  - environment
  - commit SHA (from env)
  - build date (from env)

## Install in a Strapi app

1. Add dependency:

```bash
npm install strapi-plugin-version-lens
```

Local package testing (without publishing):

```bash
npm pack
npm install /path/to/strapi-plugin-version-lens-1.0.0.tgz
```

2. Enable plugin in `config/plugins.ts`:

```ts
export default () => ({
  'version-lens': {
    enabled: true,
    config: {
      commitShaEnvKeys: ['GIT_COMMIT_SHA', 'CI_COMMIT_SHA', 'VERCEL_GIT_COMMIT_SHA'],
      buildDateEnvKeys: ['BUILD_DATE', 'CI_BUILD_DATE', 'VERCEL_BUILD_DATE'],
    },
  },
});
```

Legacy config key support: `release-radar` and `version-settings` are still read as fallback during migration.

3. Restart Strapi.

## Optional environment variables

- Commit SHA: `GIT_COMMIT_SHA`, `CI_COMMIT_SHA`, `VERCEL_GIT_COMMIT_SHA`
- Build date: `BUILD_DATE`, `CI_BUILD_DATE`, `VERCEL_BUILD_DATE`

You can override env key priority via plugin config.

## Tests and CI

- Run local tests: `npm test`
- Validate package output: `npm run pack:check`
- CI runs tests and packaging checks on push/PR for Node 20, 22, and 24.

## Project Links

- GitHub: https://github.com/Ali-Shaikh/strapi-plugin-version-lens
- Issues: https://github.com/Ali-Shaikh/strapi-plugin-version-lens/issues

## Notes

- The endpoint is an authenticated admin route.
- Host app metadata is read from the host project's `package.json`.
