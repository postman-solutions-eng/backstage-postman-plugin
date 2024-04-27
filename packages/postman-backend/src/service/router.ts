// Backstage Components
import { CacheManager, errorHandler } from '@backstage/backend-common';

// External Components
import express from 'express';
import { Logger } from 'winston';
import Router from 'express-promise-router';
import { Request, Response } from 'express';

// Config
import { Config } from '@backstage/config';

// Postman Service
import { PostmanService } from './postman/PostmanService';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  const checkForAPIKey = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.statusCode === 401) {
      res.status(401).json({ error: 'No API key provided' });
    } else {
      next();
    }
  };

  // Required parameters
  const apiKey = config?.getString('postman.apiKey');
  const baseUrl = config?.getString('postman.baseUrl');

  // Optional parameters
  const cacheManager = CacheManager.fromConfig(config);
  const cache = cacheManager.forPlugin('postman').getClient({defaultTtl: config?.has('postman.cache.ttl') ? config?.getNumber('postman.cache.ttl') : 600000 })  

  const postmanService = new PostmanService(baseUrl, apiKey, cache);

  /*
  Postman API Builder Routes
  */

  // Get API by ID
  router.get('/apis/:id', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIData(req.params.id);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  // Get API versions
  router.get('/apis/:id/versions', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIVersions(req.params.id);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  // Get API version by ID
  router.get('/apis/:id/versions/:versionId', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIVersion(req.params.id, req.params.versionId);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  /*
  Monitor Routes
  */

  // Get all monitors
  router.get('/monitors', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getAllPostmanMonitorsData(req.query.workspace ? req.query.workspace.toString() : '');
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  // Get monitor by ID
  router.get('/monitors/:id', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIMonitorData(req.params.id);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  // Get all monitors by workspace ID
  router.get('/monitors/:workspaceId', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getAllPostmanMonitorsData(req.params.workspaceId);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  /*
  Collection Routes
  */

  // Get collection by ID
  router.get('/collections/:id', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanCollection(req.params.id);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error.message, status: error.response.status });
    }
  });

  // Get collections by tag
  router.get('/tags/:tag/entities', checkForAPIKey, async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanCollectionsByTag(req.params.tag);
      res.json(data);
    } catch (error: any) {
      logger.error(error);
      res.status(error.response.status).json({ error: error });
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  router.use(errorHandler());
  return router;
}
