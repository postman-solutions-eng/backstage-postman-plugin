# Postman Plugin for Backstage

The Postman plugin integrates Postman with Backstage, allowing you to link your APIs to their corresponding collections, published APIs, and monitors within Postman. It also enables you to discover and add APIs and collections tagged in your Postman Team into your catalog. 

This is a community-driven project that extends Backstage functionalities with Postman.

## Disclaimer
This plugin is not officially supported by Postman. It is intended solely for Backstage users who need to integrate Postman into their API documentation processes.

## Production Deployment
For production use, please refer to the guidelines in [Postman Backend Plugin Installation Steps](https://github.com/postman-solutions-eng/backstage-postman-plugin).

## Local Deployment & Contribution
To run the Postman plugin locally in your Backstage application, install the following plugins:

1. **Postman Front-end Plugin:** Clone this directory into your project's `plugins/` folder to add frontend components.
2. **Postman Backend Plugin (`postman-backend`):** This plugin enables secure communication with Postman services and must be installed for the frontend plugin to function.

For installation instructions on the backend plugin, see [Postman Backend Plugin Installation](https://github.com/postman-solutions-eng/backstage-postman-plugin/tree/main/plugins/postman-backend).

## Getting Started

1. Configure your Postman API key in your local `app-config.local.yaml`:

```yaml
postman:
  baseUrl: https://api.postman.com # For EU data center, use: https://api.eu.postman.com
  apiKey: ADD_YOUR_POSTMAN_API_KEY
```

2. In your `app-config.yaml` and `app-config.production.yaml`, use the following
   syntax to reference environment variables:

```yaml
postman:
  baseUrl: https://api.postman.com # For EU data center, use: https://api.eu.postman.com
  apiKey: ${POSTMAN_API_KEY}
```

3. Import and include the <PostmanCard /> component in your API page (e.g., at
   `packages/app/src/components/Catalog/EntityPage.tsx`):

```typescript
// ...existing imports...
import { PostmanCard } from "@postman-solutions/postman-backstage-plugin";
// ...existing code...
<EntityLayout>
  <EntityLayout.Route path="/" title="Overview">
    // ...existing elements...
    <Grid item md={6} xs={12}>
      <PostmanCard />
    </Grid>
    // ...existing elements...
  </EntityLayout.Route>
</EntityLayout>;
// ...existing code...
```

### Optional Configuration

You can set a maximum height for the collection and API views using the
following options:

- **Collection Description Content Max Height**: Set with
  `collectionContentHeight` (type: `number`)
- **API Description Max Height**: Set with `APIContentHeight` (type: `number`)

```typescript
// ...existing imports...
import { PostmanCard } from "@postman-solutions/postman-backstage-plugin";
// ...existing code...
<EntityLayout>
  <EntityLayout.Route path="/" title="Overview">
    // ...existing elements...
    <Grid item md={6} xs={12}>
      <PostmanCard collectionContentHeight={600} APIContentHeight={600} />
    </Grid>
    // ...existing elements...
  </EntityLayout.Route>
</EntityLayout>;
// ...existing code...
```

## Plugin Views

Please refer to the examoles in [Postman Plugin Views](https://github.com/postman-solutions-eng/backstage-postman-plugin).

## Postman Metadata Guide

### Overview

This guide details the metadata required for the Postman plugin. Use this
metadata only for entities with `kind: API` in your YAML file. The options for
API, Collections, and Monitor views can be combined.

### Common Parameters

| Parameter              | Schema Type | Optional | Description                                                                                                                          |
| ---------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `postman/workspace/id` | string      | Yes      | The Postman workspace ID. This parameter is necessary for constructing redirect links and fetching Postman monitors using their IDs. |

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/workspace/id: "YOUR_WORKSPACE_ID_HERE"
```

### Collections

| Parameter                 | Schema Type | Optional | Description                                          |
| ------------------------- | ----------- | -------- | ---------------------------------------------------- |
| `postman/collection/id`   | string      | Yes      | The Postman collection ID.                           |
| `postman/collections/ids` | array       | Yes      | An array of Postman collection IDs.                  |
| `postman/collections/tag` | string      | Yes      | A tag to retrieve corresponding Postman collections. |

#### Get collection by ID

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collection/id: "YOUR_COLLECTION_ID"
```

#### Using collection tag

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collections/tag: "YOUR_COLLECTION_TAG_HERE"
```

#### Using collection IDs

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/collections/ids: [
    "YOUR_FIRST_COLLECTION_ID",
    "YOUR_SECOND_COLLECTION_ID",
  ]
```

### Collection Linker

The following metadata parameters are available to configure the Collection
Linker feature:

| Parameter                                      | Schema Type | Optional | Description                                                           |
| ---------------------------------------------- | ----------- | -------- | --------------------------------------------------------------------- |
| `postman/collectionLinker/enabled`             | boolean     | Yes      | Enable or disable the Collection Linker for your API entities.              |
| `postman/collectionLinker/workspaceVisibility` | string      | Yes      | Comma-separated list of workspace visibilities (e.g., 'team,public'). |

```yaml
postman:
  baseUrl: https://api.postman.com # For EU data center, use: https://api.eu.postman.com
  apiKey: ADD_YOUR_POSTMAN_API_KEY
  collectionLinker:
    enabled: true
    workspaceVisibility: "public"
```

### Monitors

| Parameter              | Schema Type | Optional | Description               |
| ---------------------- | ----------- | -------- | ------------------------- |
| `postman/monitor/id`   | string      | No       | The Postman monitor ID.   |
| `postman/monitor/name` | string      | No       | The Postman monitor name. |

#### Using monitor id

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/workspace/id: "YOUR_WORKSPACE_ID"
  postman/monitor/id: "YOUR_MONITOR_ID_HERE"
```

#### Using monitor name

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/monitor/name: "YOUR_MONITOR_NAME_HERE"
```

### APIs

| Parameter        | Schema Type | Optional | Description         |
| ---------------- | ----------- | -------- | ------------------- |
| `postman/api/id` | string      | No       | The Postman API ID. |

#### Using the API ID

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: calculation-grpc-api
  postman/api/id: "YOUR_POSTMAN_API_ID_HERE"
```
