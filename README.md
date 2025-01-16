<p align="center">
  <img src="./assets/postman-logo.png" width="200px" alt="postman logo"/>
</p>
<h1 align="center">Postman Plugin For Backstage</h1>

This plugin is designed to integrate Postman functionality into your Backstage application seamlessly. It simplifies the addition of a Postman card to your API views and enables dynamic retrieval of Postman resources like collections and APIs. Linking your APIs with Postman collections or APIs empowers consumers to interact effortlessly with these resources within the Postman interface. This includes features such as a `Run in Postman` button and the ability to dynamically fetch collections or APIs from Postman and add them to your API list using an `Entity Provider`.

# Table of Contents
- [Disclaimer and Plugin Compatibility](#disclaimer-and-plugin-compatibility)
- [Plugin Features](#plugin-features)
  - [API View](#api-view)
  - [Collections View](#collections-view)
  - [Monitor View](#monitor-view)
  - [Catalog APIs using Postman Tags](#catalog-apis-using-postman-tags)
  - [Coming soon](#coming-soon)
- [Installation](#installation)
- [Configure Postman Frontend Plugin for Backstage](#configure-postman-frontend-plugin-for-backstage)
- [Configure Postman Backend Plugin for Backstage](#configure-postman-backend-plugin-for-backstage)
  - [Prerequisites](#prerequisites)
  - [Configuration Guide](#configuration-guide)
      - [Basic Configuration](#basic-configuration)
      - [Advanced Configuration](#advanced-configuration)
  - [Configuring the Postman Entity Provider (optional)](#configuring-the-postman-entity-provider-optional)
- [Configure Backend Content Security Policy to display embedded pictures (optional)](configure-backend-content-security-policy-to-display-embedded-pictures-optional)
- [Postman Metadata Guide](#postman-metadata-guide)
  - [Metadata Object Overview](#metadata-object-overview)
  - [Common Parameters](#common-parameters)
  - [APIs](#apis)
  - [Collections (Use collection tag or IDs)](#collections-use-collection-tag-or-ids)
  - [Monitors (Use monitor ID or name)](#monitors-use-monitor-id-or-name)

## New Backstage Template for Postman Integration

To streamline the process of integrating Postman with Backstage, we have introduced a new Backstage template named `api-creation-postman-template.yaml`. This template simplifies the setup process by providing a pre-configured structure for adding Postman metadata to your Backstage entities.

### How to Use the Template

To use the `api-creation-postman-template.yaml` template, follow these steps:

1. Ensure the template file is located in your repository's `templates` directory.
2. When creating a new API entity in Backstage, select the `api-creation-postman-template.yaml` from the list of available templates.
3. Fill in the required fields, such as API name, workspace ID, and repository URL. The template includes comments to guide you through this process.
4. Once the entity is created, the Postman metadata will be automatically integrated, allowing for seamless interaction with Postman resources directly from Backstage.

For more information and to view the template, please refer to the [api-creation-postman-template.yaml](templates/api-creation-postman-template.yaml) file in the repository.

# Disclaimer and Plugin Compatibility
These backstage plugins are not officially supported by Postman and are intended for Backstage users to integrate Postman into their API documentation easily.
They have been successfully tested with Backstage v1.22, v1.23 and 1.28. Please file an issue if you are using a newer version of Backstage so that we can recommend how to integrate best under those circumstances.

# Plugin Features

This plugin offers several views which you can use to display published API information stored in Postman, show collections with a *Run In Postman* button and allow you to view your Postman monitor results on the API page.

## API View 

Displays your published Postman API data in Backstage, allowing you to access both the API information and the published API collections.

![Postman API View](assets/api.png)

Refer to the [Postman API Metadata](#APIs) for the parameters needed to display this view.

## Collections View 

This view displays the collection(s) of a given API stored in Postman. It includes a *Run in Postman* button, which is activated based on the collection ID(s) or tag defined in the `entities.yaml` file.

![Postman Collection View](assets/collection.png)

Refer to the [Postman Collections Metadata](#monitors-use-monitor-id-or-name) to see the parameters needed to display this view.

## Monitor View 

This view shows the health of your API as determined by a Postman monitor. The monitor can be displayed using its `name` or `id`. 

![Postman Monitor View](assets/monitor.png)

For more details, refer to [this section](#monitors-use-monitor-id-or-name).

## Catalog APIs using Postman Tags

You can also use this plugin to dynamically fetch **Postman APIs** or **collections** using Postman tags. For more details, please refer to [this section](#configuring-the-postman-entity-provider-optional).

![Postman Entity Provider populating APIs and collections directly from Postman using tags](https://github.com/postman-solutions-eng/backstage-postman-plugin/assets/1872314/9dfb1f9a-a092-4771-b82b-a2e622f8c05d)


## Coming soon 

A *Governance Checks* view will be added in future versions of this plugin.

# Installation

```sh
# From your Backstage root directory
yarn --cwd packages/app add @postman-solutions/postman-backstage-plugin
yarn --cwd packages/backend add @postman-solutions/postman-backstage-backend-plugin
```

The next step is configuring both plugins as described in the next two sections.

# Configure Postman Frontend Plugin for Backstage

The Postman frontend plugin enables you to link your APIs to their corresponding collections, published APIs and monitors within Postman. You can also discover APIs and collections within your Postman Team that have been tagged with a tag of your choice and add them to the catalogue.

It is a community-driven initiative to extend Backstage functionalities with Postman.

## Dependencies

> [!IMPORTANT]
> Please note that the frontend plugin will not function without the backend plugin.

Refer to the installation steps for the backend plugin [here](https://github.com/postman-solutions-eng/backstage-postman-plugin?tab=readme-ov-file#installation).

## Getting Started

1. Configure your Postman API key in your local `app-config.yaml` or production `app-config.production.yaml` file:

> [!CAUTION]
> The `apiKey` in the configuration should not belong to an admin or super admin user, as this would grant access to all collections and APIs in the team. Instead, use an `apiKey` from a user with access only to the information that can be safely displayed to the authenticated developer audience in Backstage. This principle of least privilege helps to maintain tight control over your Postman data and reduces the potential impact if a user adds a reference to an entity in a private workspace or accidentally tags a private API with the tag used by the Postman entity provider.

```yaml
postman:
    baseUrl: https://api.postman.com
    apiKey: ${YOUR_API_KEY_HERE}
```

To get a Postman API Key, follow the instructions [here](https://learning.postman.com/docs/developer/postman-api/make-postman-api-call/#get-your-api-key).

2. Import and add the <PostmanCard /> component in your `packages/app/src/components/Catalog/EntityPage.tsx` page to display the Postman card on your API page. 

``` ts
// ... other imports here
import { PostmanCard } from '@postman-solutions/postman-backstage-plugin';
// ... other components
const apiPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
    // ... other elements
    <Grid item md={6} xs={12}>
      <PostmanCard />
    </Grid>
    // ... other elements
    </EntityLayout.Route>
  </EntityLayout>
// ...
);
// ...
```

# Configure Postman Backend Plugin for Backstage

This `postman-backend` plugin provides some Postman services that the Postman frontend plugin will use to render the different component views.

## Prerequisites

Before you begin, ensure you have the following:

- Make sure the Postman Frontend Plugin is already installed and configured
- A running instance of Backstage
- Node.js and npm installed (Node.js 18.x or later is recommended)
- Access to Postman API credentials

## Configuration Guide

This guide provides instructions for configuring your application to interact with the Postman API using the `app-config.yaml` file. Follow the steps below to set up your environment correctly.

### Basic Configuration

**API Key Setup**: First, make sure to include the base URL and set an environment variable `POSTMAN_API_KEY` with your Postman API key in the configuration file if not done already.

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

# Configure Backend Content Security Policy to display embedded pictures (optional)

If your Postman API docs contain embedded pictures like this one

![image](https://github.com/postman-solutions-eng/backstage-postman-plugin/assets/1872314/70cd575c-f84d-4729-8fe0-e7b7c3084142)

you would need to include the potential image sources into the **backend** section of your `app-config.production.yaml`:

```yaml
backend:
  csp:
    img-src:
      # "'self'" and 'data' are from the backstage default but must be set since img-src is overwritten
      - "'self'"
      - 'data:'
      - https://content.pstmn.io
      - https://i.imgur.com
      - https://avatars.githubusercontent.com
```

# Postman Metadata Guide

## Metadata Object Overview

This section provides an overview of the metadata object for this Postman plugin in the context of the Backstage implementation. All parameters should only be defined with the `kind: API` in your YAML file. 

All three options, API, Collections, and Monitor, can be used in conjunction.

## Common Parameters

These parameters are common across different kinds of entities:

| Parameter | Schema Type | Optional | Description |
| --------- | ----------- | -------- | ----------- |
| `postman/domain` | string | Yes | The sub-domain of your Postman instance. E.g. if your Postman URL is `postman-demo.postman.co`, use `postman-demo`. If not defined, the application will use `go.postman.co` to redirect users to Postman. |
| `postman/workspace/id` | string | No | The ID of your Postman workspace. This ID will be used to construct the links to redirect to Postman.  |

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/domain: "postman-demo"
  postman/workspace/id: "YOUR_WORKSPACE_ID_HERE"
```

## APIs

| Parameter | Schema Type | Optional | Description |
| --------- | ----------- | -------- | ----------- |
| `postman/api/id` | string | No | The ID of your Postman API. |
| `postman/api/name` | string | Yes | (optional) The name of your Postman API. If referenced, this value will be used to fetch the API Postman monitor(s) using the API name. |


### Using the API ID
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/domain: "postman-demo"
  postman/workspace/id: "YOUR_WORKSPACE_ID_HERE"
  postman/api/id: "YOUR_POSTMAN_API_ID_HERE"
```

### API with API name
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/domain: "postman-demo"
  postman/workspace/id: "YOUR_WORKSPACE_ID_HERE"
  postman/api/id: "YOUR_POSTMAN_API_ID_HERE"
  postman/api/name: "YOUR_POSTMAN_API_NAME"
```

## Collections (Use collection tag or IDs)

| Parameter | Schema Type | Optional | Description |
| --------- | ----------- | -------- | ----------- |
| `postman/collection/id` | string | Yes | The ID of your Postman collection. |
| `postman/collections/ids` | array | Yes | An array of IDs of your Postman collections. |
| `postman/collections/tag` | string | Yes | A string specifying the collection tag to retrieve. |
| `postman/collections/pagination` | string | Yes | A 'true' or 'false" value to indicate whether you want to paginate through the results. |

### Get collection by ID
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collection/id: "YOUR_COLLECTION_ID"
```

### Using collection tag
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collections/pagination: 'true'
  postman/collections/tag: "YOUR_COLLECTION_TAG_HERE"
```

### Using collection IDs
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collections/ids: ["YOUR_FIRST_COLLECTION_ID", "YOUR_SECOND_COLLECTION_ID"]
```

## Monitors (Use monitor ID or name)

| Parameter | Schema Type | Optional | Description |
| --------- | ----------- | -------- | ----------- |
| `postman/monitor/id` | string | No | The ID of your Postman monitor. |
| `postman/monitor/name` | string | No | The name of your Postman monitor. |

### Using monitor id
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/monitor/id: "YOUR_MONITOR_ID_HERE"
```

### Using monitor name
```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/monitor/name: "YOUR_MONITOR_NAME_HERE"
```


## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code according to the terms of the license.

## Contributing
Thank you for considering contributing to this project. For more information on how to get started, please check out the [contribution guidelines](CONTRIBUTING.md).

## Code of Conduct

We expect all contributors to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Please review the guidelines before contributing to ensure a positive and inclusive community for everyone.

## Contact

If you have any questions, concerns, or suggestions regarding this project, feel free to contact [@aphanor-postman](https://github.com/aphanor-postman) or [@jonico](https://github.com/jonico).
