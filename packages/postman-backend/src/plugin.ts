import {
  coreServices,
  createBackendPlugin
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

// Services
import { PostmanService } from './services/postman';
import { NodeCacheService } from './services/node-cache/cacheService';

// Mock services
// import { mockServices } from '@backstage/backend-test-utils/index';

export const postmanBackendPlugin = createBackendPlugin({
  pluginId: 'postman',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig
      },
      async init({ logger, httpAuth, httpRouter, config }) {
        const baseUrl = config.getString('postman.baseUrl');
        const apiKey = config.getString('postman.apiKey');
        const collectionLinkerConfig = {
          enabled: config.has('postman.collectionLinker.enabled') ? config.getBoolean('postman.collectionLinker.enabled') : false,
          workspaceVisibility: config.has('postman.collectionLinker.workspaceVisibility') ? config.getString('postman.collectionLinker.workspaceVisibility') : 'team,public'
        };

        const ttl = config.has('postman.cache.ttl')
          ? config.getNumber('postman.cache.ttl')
          : 600; // default to 600 seconds
        const cache = new NodeCacheService({ defaultTtl: ttl });

        const postmanService = new PostmanService(baseUrl, apiKey, collectionLinkerConfig, cache);

        const router = await createRouter({
          // httpAuth: httpAuth || mockServices.httpAuth(),
          httpAuth,
          postmanService
        });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/:id',
          allow: 'unauthenticated',
        })

        logger.info('Postman Backend plugin initialized');
      },
    });
  },
});