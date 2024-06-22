# Postman Backend Plugin for Backstage

This `postman-backend` plugin provides some Postman services that will be used by the Postman frontend plugin to render the different component views.

## Disclaimer
This plugin is not officially supported by Postman and is intended for Backstage users to integrate Postman into their API documentation easily.

## Prerequisites

Before you begin, ensure you have the following:

- Make sure the [Postman frontend](https://github.com/postman-solutions-eng/backstage-demo/tree/main/plugins/postman) is installed first
- A running instance of Backstage
- Node.js and npm installed (Node.js 18.x or later is recommended)
- Access to Postman API credentials

## Configuration Guide

This guide provides instructions for configuring your application to interact with the Postman API using the `app-config.yaml` file. Follow the steps below to set up your environment correctly.

### Basic Configuration

**API Key Setup**: First, include the base URL and set an environment variable `POSTMAN_API_KEY` with your Postman API key in the configuration file.

> [!CAUTION]
> The `apiKey` in the configuration should not belong to an admin or super admin user, as this would grant access to all collections and APIs in the team. Instead, use an `apiKey` from a user with access only to the information that can be safely displayed to the authenticated developer audience in Backstage. This principle of least privilege helps to maintain tight control over your Postman data and reduces the potential impact if a user adds a reference to an entity in a private workspace or accidentally tags a private API with the tag used by the Postman entity provider.

```yaml
    postman:
        baseUrl: https://api.postman.com
        apiKey: ${POSTMAN_API_KEY}
```

### Advanced Configuration

1. **Entity Provider Setup**: The plugin includes an entity provider to fetch API assets from Postman periodically using a Postman tag. Tags can be added to [collections](https://learning.postman.com/docs/collections/using-collections/#tagging-a-collection) or [Postman APIs](https://learning.postman.com/docs/designing-and-developing-your-api/managing-apis/#tagging-apis). To use this option, please add the following settings to your `app-config.yaml`:

    | Parameter | Schema Type | Optional | Description |
    | --------- | ----------- | -------- | ----------- |
    | `postman/team` | string | Yes | Name of your Postman team. For a team URL like `https://myteam.postman.co`, your team name would be `myteam.postman.co`. |
    | `postman/owner` | string | Yes | Owner of the API assets. The default is "postman". Consider creating a User or Group for this owner. |
    | `postman/synchEntitiesWithTag` | string | Yes | Postman tag used to fetch API assets. |
    | `postman/entityProviderSynchInterval` | string | Yes | Interval (in hours) for fetching the API assets from Postman. |
    | `postman/system` | string | Yes | System of the API assets. The default is "main". |

    Example configuration:

  ```yaml
    postman:
        baseUrl: https://api.postman.com
        apiKey: ${POSTMAN_API_KEY}
        team: my-team.postman.co
        synchEntitiesWithTag: backstage
        owner: postman-team
        entityProviderSynchInterval: 2
        system: my-system
  ```

2. **Caching Options**: The Postman backend plugin supports caching. Configure cache settings by adding the following properties:

    | Parameter | Schema Type | Optional | Description |
    | --------- | ----------- | -------- | ----------- |
    | `postman/cache/ttl` | number | Yes | Cache expiry time in milliseconds. The default is 600000 (10 minutes). |

    Example configuration for a custom cache duration:

    ```yaml
    postman:
        baseUrl: https://api.postman.com
        apiKey: ${POSTMAN_API_KEY}
        team: my-team.postman.co
        cache:
          ttl: 300000  # 5 minutes
    ```

If you prefer not to utilise caching and always get the latest information from Postman, you can set the TTL value to 0 or any value smaller than the interval at which the entity service refreshes.

### Add the backend plugin to your Backstage application (newer Backstage versions >= v1.24)

1. Modify file `packages/backend/src/index.ts`, and add the following to it:

```ts
...

import { createBackend } from '@backstage/backend-defaults';

// new code after other imports
import { loggerToWinstonLogger, CacheManager } from '@backstage/backend-common';
import {
  coreServices,
  createBackendPlugin,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { PostmanEntityProvider, createRouter as postmanRouter } from '@postman-solutions/postman-backstage-backend-plugin';

const backend = createBackend();
...
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// new code after all other plugins have been added to backend

backend.add(createBackendPlugin({
  pluginId: 'postman',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, httpRouter }) {
        
        const legacyLogger = loggerToWinstonLogger(logger);
        httpRouter.use(await postmanRouter({ config, logger: legacyLogger }));
        httpRouter.addAuthPolicy({
          path: '/:id',
          allow: 'unauthenticated',
        })
      },
    });
  },
}));

// optional for the entity service
const postmanEntityServiceModule = createBackendModule({
  pluginId: 'catalog', // name of the plugin that the module is targeting
  moduleId: 'custom-extensions',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, config, logger, scheduler}) {
        const cacheManager = CacheManager.fromConfig(config);
        const cache = cacheManager.forPlugin('postman').getClient({defaultTtl: config?.getNumber('postman.cache.ttl') ?? 60000 })
        const postmanEntityProvider = PostmanEntityProvider.fromConfig(config, {logger: logger, cache})
        const postmanEntityProviderSynchInterval = config?.getNumber('postman.entityProviderSynchInterval') ?? 5;
        catalog.addEntityProvider(postmanEntityProvider);

        await scheduler.scheduleTask({
          id: 'run_postman_entity_provider_refresh',
          fn: async () => {
            await postmanEntityProvider.run();
          },
          frequency: { minutes: postmanEntityProviderSynchInterval },
          timeout: { minutes: 10 },
        });

      },
    });
  },
});
backend.add(postmanEntityServiceModule);

backend.start();
```


### Add the backend plugin to your Backstage application (older Backstage versions < 1.24)

1. Create a new file named `packages/backend/src/plugins/postmanbackend.ts`, and add the following to it:

```ts
import { PluginEnvironment } from '../types';
import { createRouter } from '@postman-solutions/postman-backstage-backend-plugin';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
```

2. Next, let's wire this into the overall backend router, edit `packages/backend/src/index.ts`:

```ts
import postmanbackend from './plugins/postmanbackend';
// ...
async function main() {
  // ...
  // Add this line under the other lines that follow the useHotMemoize pattern
  const postmanBackEndEnv = useHotMemoize(module, () => createEnv('postman-backend'));
  // ...
  // Insert this line under the other lines that add their routers to apiRouter in the same way
  apiRouter.use('/postman', await postmanbackend(postmanBackEndEnv));
// ...
}
```

3. (optional) you can run `yarn start-backend` from the root directory to start the backend server

## Configuring the Postman Entity Provider (optional)

The Postman EntityProvider is an optional component that allows you to dynamically retrieve Postman APIs and collections that have been tagged with a certain Postman tag, e.g. `backstage`.
In order for it to work, you would need to add some more properties to your local `app-config.yaml` or production `app-config.production.yaml` file:

```yaml
postman:
    baseUrl: https://api.postman.com
    apiKey: ${POSTMAN_API_KEY}
    synchEntitiesWithTag: TAG_NAME
    entityProviderSynchInterval: SYNC_FREQUENCY_IN_MINUTES (optional)    
```

Additionally, if you are using an older version of Backstage ( < 1.24) you would need to insert the following lines into your `packages/backend/src/plugins/catalog.ts` file:

``` ts
...
// new code after other imports
import { PostmanEntityProvider } from '@postman-solutions/postman-backstage-backend-plugin';
import { CacheManager } from '@backstage/backend-common';
...

...
    const builder = CatalogBuilder.create(env);
    
    // new code after builder got instantiated
    const cacheManager = CacheManager.fromConfig(env.config);
    const cache = cacheManager.forPlugin('postman').getClient({defaultTtl: env.config?.getNumber('postman.cache.ttl') ?? 60000 })
    const postmanEntityProvider = PostmanEntityProvider.fromConfig(env.config, {logger: env.logger, cache})
    const postmanEntityProviderSynchInterval = env.config?.getNumber('postman.entityProviderSynchInterval') ?? 5;
    builder.addEntityProvider(postmanEntityProvider);

...

...
    await processingEngine.start();

    // new code after processing engine started
    await env.scheduler.scheduleTask({
      id: 'run_postman_entity_provider_refresh',
      fn: async () => {
        await postmanEntityProvider.run();
      },
      frequency: { minutes: postmanEntityProviderSynchInterval },
      timeout: { minutes: 10 },
    });
...
```

For newer versions of Backstage (v1.24+), we included the entity service initialization code in our modifications for `packages/backend/src/index.ts`.
