# Postman Backend Plugin for Backstage

This `postman-backend` plugin provides some Postman services that will be used by the Postman frontebd plugin to render the different component views.

# Disclaimer
This plugin is not officially supported by Postman and is intended for Backstage users to easily integrate Postman into their API documentation.

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
> The `apiKey` in the configuration should not belong to an admin or super admin user, as this would grant access to all collections and APIs in the team. Instead, use an `apiKey` from a user that has access only to the information that can be safely displayed to the authenticated developer audience in Backstage. This principle of least privilege helps to maintain tight control over your Postman data and reduces the potential impact if a user adds a reference to an entity in a private workspace or accidentally tags a private API with the tag used by the Postman entity provider.

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
    | `postman/owner` | string | Yes | Owner of the API assets. Default is "postman". Consider creating a User or Group for this owner. |
    | `postman/synchEntitiesWithTag` | string | Yes | Postman tag used to fetch API assets. |
    | `postman/entityProviderSynchInterval` | string | Yes | Interval (in hours) for fetching the API assets from Postman. |
    | `postman/system` | string | Yes | System of the API assets. Default is "main". |

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
    | `postman/cache/ttl` | number | Yes | Cache expiry time in milliseconds. Default is 600000 (10 minutes). |

    Example configuration for a custom cache duration:

    ```yaml
    postman:
        baseUrl: https://api.postman.com
        apiKey: ${POSTMAN_API_KEY}
        team: my-team.postman.co
        cache:
          ttl: 300000  # 5 minutes
    ```

If you do not like to apply caching / get quicker updates when new entities get tagged, set a ttl to 0 or a value smaller than the entity service refresh interval.

### Add the backend plugin to your Backstage application 

1. Create a new file named `packages/backend/src/plugins/postmanbackend.ts`, and add the following to it:

```ts
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { createRouter } from '@internal/backstage-plugin-postman-backend';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
```

5. Next, let's wire this into the overall backend router, edit `packages/backend/src/index.ts`:

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

6. (optional), you can run `yarn start-backend` from the root directory to start the backend server

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code according to the terms of the license.

## Contributing
Thank you for considering contributing to this project! Please check out the [contribution guidelines](CONTRIBUTING.md) for more information on how to get started.

## Code of Conduct

We expect all contributors to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Please review the guidelines before contributing to ensure a positive and inclusive community for everyone.

## Contact

If you have any questions, concerns, or suggestions regarding this project, feel free to contact [@aphanor-postman](https://github.com/aphanor-postman) or [@jonico](https://github.com/jonico).
