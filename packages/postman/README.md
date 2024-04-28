# Postman Plugin for Backstage

The Postman frontend plugin enables you to link your APIs to their corresponding collections, published APIs and monitors within Postman. You can also discover APIs and collections within your Postman Team that have been tagged with a tag of your choice and add them to the catalogue.

It is a community-driven initiative to extend Backstage functionalities with Postman.

## Disclaimer
This plugin is not officially supported by Postman and is intended for Backstage users to integrate Postman into their API documentation easily.

## Dependencies

> [!IMPORTANT]
> Please note that the frontend plugin will not function without the backend plugin.

Refer to the installation steps for the backend plugin [here](https://github.com/postman-solutions-eng/backstage-postman-plugin?tab=readme-ov-file#installation).

## Getting Started

1. Import and add the <PostmanCard /> component in your `packages/app/src/components/Catalog/EntityPage.tsx` page to display the Postman card on your API page.

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

2. Edit your `entities.yaml` file and add the [Postman metadata](#postman-metadata-guide) to display the different views that this plugin offers. More information about the metadata object can be found [here](#postman-metadata-guide).

## Configuring the Postman Entity Provider (optional)

The Postman EntityProvider is an optional component that allows you to dynamically retrieve Postman APIs and collections that have been tagged with a certain Postman tag, e.g. `backstage`.
In order for it to work, you would need to add some more properties to your local `app-config.yaml` or production `app-config.production.yaml` file:

```yaml
postman:
    baseUrl: https://api.postman.com
    apiKey: 
        $env: YOUR_ENVIRONMENT_VARIABLE_NAME
    synchEntitiesWithTag: TAG_NAME
    entityProviderSynchInterval: SYNC_FREQUENCY_IN_MINUTES (optional)    
```

Additionally, you would need to insert the following lines into your `packages/backend/src/plugins/catalog.ts` file:

``` ts
...
// new code after other imports
import { PostmanEntityProvider } from '@postman-solutions/postman-backstage-plugin-backend';
...

...
    const builder = CatalogBuilder.create(env);
    
    // new code after builder got instantiated
    const postmanEntityProvider = PostmanEntityProvider.fromConfig(env.config, {logger: env.logger})
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
