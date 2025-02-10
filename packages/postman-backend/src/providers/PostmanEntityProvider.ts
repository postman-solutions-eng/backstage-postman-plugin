import { Config } from "@backstage/config";
import { ApiEntityV1alpha1 } from "@backstage/catalog-model";
import { LoggerService } from "@backstage/backend-plugin-api";
import {
  EntityProvider,
  EntityProviderConnection,
} from "@backstage/plugin-catalog-node";
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_VIEW_URL,
} from "@backstage/catalog-model";
import { buildClientSchema, printSchema } from "graphql";

// Your CacheService implementation (external to Backstage)
import { CacheService } from "../services/node-cache/cacheService";

// Postman Service
import { PostmanService } from "../services/postman";

function calculatePostmanGoUrlFromAPIUrl(postmanAPIUrl: string): string {
  const url = new URL(postmanAPIUrl);
  let domain = url.hostname;
  const domainParts = domain.split(".");
  if (domainParts[0] === "api") {
    domainParts[0] = "go";
  }
  domainParts[domainParts.length - 1] = "co";
  domain = domainParts.join(".");
  return `${url.protocol}//${domain}`;
}

export class PostmanEntityProvider implements EntityProvider {
  private readonly baseUrl: string;
  private readonly logger: LoggerService;
  protected goUrl: string;
  protected cache: CacheService;
  protected readonly tag: string;
  protected readonly apiKey: string;
  protected readonly collectionLinkerConfig: any;
  protected readonly owner: string;
  protected readonly system: string;
  protected postmanService: PostmanService;
  protected connection?: EntityProviderConnection;

  /**
   * Factory method used by the plugin environment to instantiate the provider.
   * In the new backend system, you’ll pass in the configuration (typically the injected
   * root config via coreServices.rootConfig) along with other required dependencies.
   */
  static fromConfig(
    config: Config,
    options: { logger: LoggerService; cache: CacheService },
  ): PostmanEntityProvider {
    // Required parameters from configuration
    const apiKey = config.getString("postman.apiKey");
    const baseUrl = config.getString("postman.baseUrl");
    // Optional parameters
    const collectionLinkerConfig = {
      enabled: config.has('postman.collectionLinker.enabled') ? config.getBoolean('postman.collectionLinker.enabled') : false,
      workspaceVisibility: config.has('postman.collectionLinker.workspaceVisibility') ? config.getString('postman.collectionLinker.workspaceVisibility') : 'team,public'
    };
    const owner: string = config.has("postman.owner")
      ? config.getString("postman.owner")
      : "postman";
    const system: string = config.has("postman.system")
      ? config.getString("postman.system")
      : "main";
    const tag: string = config.has("postman.entityProvider.synchEntitiesWithTag")
      ? config.getString("postman.entityProvider.synchEntitiesWithTag")
      : "";
    const postmanDomain: string = config.has("postman.team")
      ? `https://${config.getString("postman.team")}`
      : calculatePostmanGoUrlFromAPIUrl(baseUrl);

    return new PostmanEntityProvider({
      ...options,
      baseUrl,
      apiKey,
      owner,
      tag,
      system,
      postmanDomain,
      collectionLinkerConfig
    });
  }

  private constructor(options: {
    logger: LoggerService;
    cache: CacheService;
    baseUrl: string;
    apiKey: string;
    collectionLinkerConfig: any
    owner: string;
    system: string;
    tag: string;
    postmanDomain: string;
  }) {
    this.owner = options.owner;
    this.system = options.system;
    this.tag = options.tag;
    this.cache = options.cache;
    this.logger = options.logger;
    this.apiKey = options.apiKey;
    this.collectionLinkerConfig = options.collectionLinkerConfig;
    this.baseUrl = options.baseUrl;
    this.goUrl = options.postmanDomain;
    // Instantiate the PostmanService using the provided parameters and cache instance.
    this.postmanService = new PostmanService(
      this.baseUrl,
      this.apiKey,
      this.collectionLinkerConfig,
      this.cache
    );
  }

  getProviderName(): string {
    return `postmanProvider`;
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    this.logger.info(
      `PostmanEntityProvider connected: ${JSON.stringify(this.connection)}`,
    );
  }

  async run(): Promise<void> {
    const maxWaitTimeMs = 10000;
    const intervalMs = 100;
    let waited = 0;

    while (!this.connection && waited < maxWaitTimeMs) {
      this.logger.warn("Connection not yet initialized; waiting...");
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      waited += intervalMs;
    }

    if (!this.connection) {
      this.logger.error("Connection was not initialized after waiting.");
      throw new Error("User Connection not initialized");
    }

    if (this.baseUrl === "" || this.tag === "") {
      this.logger.info(
        "Not automatically syncing Postman entities since required parameters are not set.",
      );
      return;
    }

    const collections: any[] = [];
    const apis: any[] = [];
    const apiEntities: ApiEntityV1alpha1[] = [];

    this.logger.info(`Retrieving collections with tag ${this.tag} ...`);

    let cursor: string | undefined;
    do {
      const _response = await this.postmanService.getPostmanCollectionsByTag(
        this.tag,
        cursor,
      );

      // Process collections
      for await (
        const collection of _response.data.entities.filter(
          (_entity: any) => _entity.entityType === "collection",
        )
      ) {
        try {
          const response = await this.postmanService.getPostmanCollection(
            collection.entityId,
          );
          const tags = await this.postmanService.getCollectionTags(
            collection.entityId,
          );
          collections.push({
            ...response.collection.info,
            id: collection.entityId,
            definition: JSON.stringify(response, null, 4),
            tags,
          });
        } catch (error) {
          this.logger.error(
            `Error processing collection ${collection.entityId}: ${error}`,
          );
        }
      }

      // Process APIs
      for await (
        const api of _response.data.entities.filter(
          (_entity: any) => _entity.entityType === "api",
        )
      ) {
        try {
          const response = await this.postmanService.getPostmanAPIData(
            api.entityId,
          );
          const tags = await this.postmanService.getAPITags(api.entityId);
          apis.push({
            ...response,
            definition: JSON.stringify(response, null, 4),
            tags,
          });
        } catch (error) {
          this.logger.error(`Error processing API ${api.entityId}: ${error}`);
        }
      }

      // Create catalog entities from collections
      collections.forEach((collection) => {
        try {
          this.logger.info(`Processing collection ${collection.id} ...`);
          const apiEntity: ApiEntityV1alpha1 = {
            apiVersion: "backstage.io/v1alpha1",
            kind: "API",
            spec: {
              type: "rest",
              lifecycle: "experimental",
              owner: this.owner,
              definition: collection.definition,
              system: this.system,
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
                [ANNOTATION_VIEW_URL]:
                  `${this.goUrl}/collection/${collection.id}`,
              },
            },
          };
          apiEntities.push(apiEntity);
        } catch (error) {
          this.logger.error(
            `Error processing collection ${collection.id}: ${error}`,
          );
        }
      });

      // Create catalog entities from APIs
      for await (const api of apis) {
        try {
          this.logger.info(`Processing API ${api.id} ...`);

          let apiDefinition;
          let apiType = "rest";

          try {
            apiDefinition = JSON.parse(api?.definition);
            apiType = apiDefinition?.gitInfo ? "rest" : "openapi";
          } catch (error) {
            apiDefinition = api?.definition;
          }

          try {
            if (apiDefinition?.schemas?.length > 0) {
              const schema = apiDefinition.schemas[0];
              const _definition = await this.postmanService.getPostmanAPISchema(
                api.id,
                schema.id,
              );
              apiType = _definition.type.includes("openapi")
                ? "openapi"
                : _definition.type;
              try {
                if (apiType === "openapi") {
                  apiDefinition = JSON.parse(_definition.content);
                  apiDefinition = JSON.stringify(apiDefinition, null, 4);
                } else if (apiType === "graphql") {
                  const _schema = buildClientSchema(
                    JSON.parse(_definition.content)?.data,
                  );
                  apiDefinition = printSchema(_schema);
                } else {
                  apiDefinition = _definition.content;
                }
              } catch (error) {
                apiDefinition = _definition.content;
              }
            } else {
              try {
                apiDefinition = JSON.stringify(
                  JSON.parse(api?.definition),
                  null,
                  4,
                );
              } catch (error) {
                apiDefinition = api?.definition;
              }
            }
          } catch (error) {
            this.logger.warn(`Error reading API schema of ${api.id}: ${error}`);
            apiDefinition = api?.definition;
          }

          const apiEntity: ApiEntityV1alpha1 = {
            apiVersion: "backstage.io/v1alpha1",
            kind: "API",
            spec: {
              type: apiType,
              lifecycle: "experimental",
              owner: this.owner,
              definition: apiDefinition,
              system: this.system,
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
                [ANNOTATION_VIEW_URL]: `${this.goUrl}/api/${api.id}`,
              },
            },
          };
          apiEntities.push(apiEntity);
        } catch (error) {
          this.logger.error(`Error processing API ${api.id}: ${error}`);
        }
      }

      await this.connection.applyMutation({
        type: "full",
        entities: apiEntities.map((entity) => ({ entity })),
      });

      cursor = _response.meta.nextCursor;
    } while (cursor);
  }
}
