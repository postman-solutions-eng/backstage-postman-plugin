# Postman Backend Plugin

The Postman Backend Plugin integrates with Postman's API to provide seamless access to API metadata, versions, monitors, collections, tags, users, and workspaces.

## Features

This plugin exposes various endpoints, including:
- API Information:
  - GET `/apis/:id`
  - GET `/apis/:id/versions`
  - GET `/apis/:id/versions/:versionId`
- Monitor Management:
  - GET `/monitors`
  - GET `/monitors/:id`
- Collection Handling:
  - GET `/collections/:id`
  - GET `/tags/:tag/entities`
  - GET `/collections/:id/tags`
  - PUT `/collections/:id/tags`
- User and Workspace Details:
  - GET `/users`
  - GET `/workspaces`
  - GET `/workspace/:workspaceId`

## Production Installation

For production use, please refer to the guidelines in [Postman Plugin Installation Steps](https://github.com/postman-solutions-eng/backstage-postman-plugin).

## Local Installation & Contribution

After cloning the `postman` and `postman-backend` plugins, rename the package names in their respective `package.json` with `@internal/PLUGIN_NAME` and install the backend plugin. Run the following command from your project root:

```bash
yarn --cwd packages/backend add @internal/backstage-plugin-postman-backend
```

Then register the plugin in your backend (typically in `packages/backend/src/index.ts`):

```typescript
const backend = createBackend();
// ...existing code...
backend.add(import('@internal/backstage-plugin-postman-backend'));
```

### Entity Provider Integration (Optional)

Entity Providers in Backstage enable automatic integration of external data into the catalog. The Postman EntityProvider allows you to:
- Automatically fetch and synchronize collections or APIs tagged for inclusion.
- Benefit from built-in caching, which minimizes API requests.

To set up the Postman EntityProvider:

1. Ensure that your `app-config.yaml` includes the following configuration:
```yaml
postman:
  baseUrl: https://api.postman.com # For EU data center, use: https://api.eu.postman.com
  apiKey: ${POSTMAN_API_KEY}
  entityProvider:
    synchEntitiesWithTag: backstage-plugin
    synchInterval: 2
  cache:
    ttl: 60000
```

2. In your backend module (usually `packages/backend/src/index.ts`), register the provider:
```typescript
// ...existing imports...
import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PostmanEntityProvider, NodeCacheService } from '@internal/backstage-plugin-postman-backend';

export const catalogModulePostmanProvider = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'postman-provider',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        reader: env.coreServices.urlReader,
        scheduler: env.coreServices.scheduler,
        config: env.coreServices.rootConfig,
        logger: env.coreServices.logger,
      },
      async init({ catalog, scheduler, config, logger }) {
        const cache = new NodeCacheService({
          defaultTtl: config.has('postman.cache.ttl')
            ? config.getNumber('postman.cache.ttl')
            : 600,
        });
        const provider = PostmanEntityProvider.fromConfig(config, { logger, cache });
        catalog.addEntityProvider(provider);
        const synchInterval = config.has('postman.entityProvider.synchInterval')
          ? config.getNumber('postman.entityProvider.synchInterval')
          : null;
        if (synchInterval) {
          await scheduler.scheduleTask({
            id: 'run_postman_entity_provider_refresh',
            fn: async () => await provider.run(),
            frequency: { minutes: synchInterval },
            timeout: { minutes: 10 },
          });
          logger.info('Postman EntityProvider registered with the catalog');
        } else {
          logger.info('Postman EntityProvider registered, but auto refresh is disabled');
        }
      },
    });
  },
});
```

3. Finally, integrate the module into your backend initialization:
```typescript
// ...existing code...
import { catalogModulePostmanProvider } from '@internal/backstage-plugin-postman-backend';
// ...existing code...
backend.add(catalogModulePostmanProvider);
backend.start();
```

### Caching

The plugin employs caching to reduce redundant HTTP requests and boost performance. The two main caching strategies are:

1. HTTP Request Caching:
   - Responses from the Postman API are cached based on a configurable TTL.
2. Entity Data Caching:
   - The PostmanEntityProvider caches entities between synchronization cycles to decrease processing overhead.

You can adjust the cache settings in your `app-config.yaml`:
```yaml
postman:
  cache:
    ttl: 60000  # Cache TTL in seconds. Default 600 seconds
```

## Development

To run the plugin backend in standalone mode, execute:

```bash
yarn start
```

For full-stack development (including the frontend), run:

```bash
yarn dev
```

## Testing

To execute tests for the plugin, run:

```bash
yarn test
```

Note:
- Ensure that you have enabled the mock service by uncommenting the necessary sections in your test files (e.g., in plugin.test.ts and router.test.ts).
- This allows the tests to use the mocked authentication and other services.
  
Ensure your test configuration aligns with your backend setup.
