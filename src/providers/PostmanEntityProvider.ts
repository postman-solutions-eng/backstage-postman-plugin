// Backstage services and components
import { Config } from '@backstage/config';
import { ApiEntityV1alpha1 } from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api';
import { EntityProvider, EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { ANNOTATION_LOCATION, ANNOTATION_ORIGIN_LOCATION, ANNOTATION_VIEW_URL } from '@backstage/catalog-model';
import { buildClientSchema, printSchema } from 'graphql';

// Cache Service
import { CacheClient } from '@backstage/backend-common';

// Postman Service
import { PostmanService } from '../service/postman/PostmanService';

function calculatePostmanGoUrlFromAPIUrl(postmanAPIUrl: string): string {
  // Create a new URL object
  const url = new URL(postmanAPIUrl);

  // Extract the hostname from the URL
  let domain = url.hostname;

  // Split the domain into parts
  const domainParts = domain.split('.');

  // Check if 'api' is a subdomain and replace it with 'go'
  if (domainParts[0] === 'api') {
    domainParts[0] = 'go';
  }

  // Replace the last part of the domain with 'co'
  domainParts[domainParts.length - 1] = 'co';

  // Join the domain parts back together
  domain = domainParts.join('.');

  // add original protocol again
  domain = `${url.protocol}//${domain}`;

  return domain;
}

export class PostmanEntityProvider implements EntityProvider {

  private readonly baseUrl: string;
  private readonly logger: LoggerService;

  protected goUrl: string;
  protected cache: CacheClient;
  protected readonly owner: string;
  protected readonly tag: string;
  protected readonly apiKey: string;
  protected postmanService: PostmanService;
  protected connection?: EntityProviderConnection;

  static fromConfig(config: Config, options: { logger: LoggerService, cache: CacheClient }) {

    // Required parameters
    const apiKey = config?.getString('postman.apiKey');
    const baseUrl = config?.getString('postman.baseUrl');

    // Optional parameters
    const owner: string = config?.has('postman.owner') ? config.getString('postman.owner') : 'postman';
    const tag: string = config?.has('postman.synchEntitiesWithTag') ? config.getString('postman.synchEntitiesWithTag') : '';
    const postmanDomain: string = config?.has('postman.team') ? `https://${config.getString('postman.team')}` : calculatePostmanGoUrlFromAPIUrl(config.getString('postman.baseUrl'));

    return new PostmanEntityProvider({
      ...options,
      baseUrl,
      apiKey,
      owner,
      tag,
      postmanDomain
    })
  }

  private constructor(options: {
    logger: LoggerService,
    cache: CacheClient,
    baseUrl: string,
    apiKey: string,
    owner: string,
    tag: string,
    postmanDomain: string
  }) {
    this.owner = options.owner;
    this.tag = options.tag;
    this.cache = options.cache;
    this.logger = options.logger;
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.goUrl = options.postmanDomain;
    this.postmanService = new PostmanService(this.baseUrl ?? '', this.apiKey ?? '', this.cache);
  }
  getProviderName(): string {
    return `postmanProvider`;
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('User Connection Not initialized');
    }

    if (this.baseUrl === '' || this.baseUrl === '' || this.tag === '') {
      this.logger.info("Do not automatically synch Postman Entities from tags as required parameters are not set.");
      return
    }

    const collections = [];
    const apis = [];
    const apiEntities: ApiEntityV1alpha1[] = [];

    this.logger.info(`Retrieving collections with tag ${this.tag} ...`);

    // In the first call, we don't pass the cursor, we iterate as long as the response has a cursor called meta.nextCursor
    let cursor: string | undefined;
    do {
      const _response = await this.postmanService.getPostmanCollectionsByTag(this.tag, cursor);

      for await (const collection of _response.data.entities
        .filter((_entity: any) => _entity.entityType === 'collection')) {
        try {
          const response = await this.postmanService.getPostmanCollection(collection.entityId);
          const tags = await this.postmanService.getCollectionTags(collection.entityId);
          collections.push({ ...response.collection.info, id: collection.entityId, definition: JSON.stringify(response, null, 4), tags });
        } catch (error) {
          this.logger.error(`Error processing collection ${collection.entityId}: ${error}`);
        }
      }

      for await (const api of _response.data.entities
        .filter((_entity: any) => _entity.entityType === 'api')) {
        try {
          const response = await this.postmanService.getPostmanAPIData(api.entityId);
          const tags = await this.postmanService.getAPITags(api.entityId);
          apis.push({ ...response, definition: JSON.stringify(response, null, 4), tags });
        } catch (error) {
          this.logger.error(`Error processing API ${api.entityId}: ${error}`);
        }
      }
      
      collections.forEach(collection => {
        try {
          this.logger.info(`Processing collection ${collection.id} ...`);
          const apiEntity: ApiEntityV1alpha1 = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'API',
            spec: {
              type: 'rest',
              lifecycle: 'experimental',
              owner: this.owner,
              definition: collection.definition,
              system: 'main'
            },
            metadata: {
              name: collection.uid,
              title: collection.name,
              description: collection.description ?? collection.name,
              tags: collection.tags,
              "postman/collections/ids": [collection.id],
              annotations: {
                [ANNOTATION_LOCATION]: `url:${this.baseUrl}`,
                [ANNOTATION_ORIGIN_LOCATION]: `url:${this.baseUrl}`,
                [ANNOTATION_VIEW_URL]: `${this.goUrl}/collection/${collection.id}`
              },
            }
          }
          apiEntities.push(apiEntity);
        } catch (error) {
          this.logger.error(`Error processing collection ${collection.id}: ${error}`);
        }
      });

      for await (const api of apis) {
        try {
          this.logger.info(`Processing API ${api.id} ...`);

          let apiDefinition;
          let apiType = 'rest'; // Default to 'rest'

          try {
            apiDefinition = JSON.parse(api?.definition);
            apiType = apiDefinition?.gitInfo ? 'rest' : 'openapi';
          } catch (error) {
            // If it's not a valid JSON, use the verbatim content
            apiDefinition = api?.definition;
          }

          try {
            if (apiDefinition?.schemas?.length > 0) {
              const schema = apiDefinition.schemas[0];
              const _definition = await this.postmanService.getPostmanAPISchema(api.id, schema.id);
              apiType = _definition.type.includes('openapi') ? 'openapi' : _definition.type;
              try {
                if (apiType === 'openapi') {
                  apiDefinition = JSON.parse(_definition.content);
                  apiDefinition = JSON.stringify(apiDefinition, null, 4);
                } else if (apiType === 'graphql') {
                  const schema = buildClientSchema(JSON.parse(_definition.content)?.data);
                  apiDefinition = printSchema(schema);
                } else {
                  apiDefinition = _definition.content;
                }
              } catch (error) {
                // If it's not a valid JSON, use the verbatim content
                apiDefinition = _definition.content;
              }
            } else {
              try {
                apiDefinition = JSON.stringify(JSON.parse(api?.definition), null, 4);
              } catch (error) {
                // If it's not a valid JSON, use the verbatim content
                apiDefinition = api?.definition;
              }
            }
          } catch (error) {
            this.logger.warn(`Error reading API schena of ${api.id}: ${error}`);
            apiDefinition = api?.definition;
          }

          const apiEntity: ApiEntityV1alpha1 = {
            apiVersion: 'backstage.io/v1alpha1',
            kind: 'API',
            spec: {
              type: apiType,
              lifecycle: 'experimental',
              owner: this.owner,
              definition: apiDefinition,
              system: 'main'
            },
            metadata: {
              name: api.id,
              title: api.name,
              description: api.description ?? api.name,
              tags: api.tags,
              "postman/api/id": api.id,
              "postman/api/name": api.name,
              annotations: {
                [ANNOTATION_LOCATION]: `url:${this.baseUrl}`,
                [ANNOTATION_ORIGIN_LOCATION]: `url:${this.baseUrl}`,
                [ANNOTATION_VIEW_URL]: `${this.goUrl}/api/${api.id}`
              },
            }
          }
          apiEntities.push(apiEntity);
        } catch (error) {
          this.logger.error(`Error processing API ${api.id}: ${error}`);
        }
      };

      await this.connection.applyMutation({
        type: 'full',
        entities: apiEntities.map((entity) => ({
          entity
        })),
      })
      cursor = _response.meta.nextCursor;
    } while (cursor)
  }
}