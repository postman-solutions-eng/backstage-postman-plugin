/* eslint-disable no-param-reassign */
import axios from 'axios';
import { CacheService } from '../node-cache/cacheService';

interface HttpRequestOptions {
  method?: 'get' | 'post' | 'put' | 'delete';
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: any;
}

export class PostmanService {
  public readonly cache: CacheService;

  public options: any = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  constructor(private baseUrl: string, private apiKey: string, private collectionLinkerConfig: any, cache: CacheService) {
    this.cache = cache;
    this.options.headers['X-Api-Key'] = this.apiKey;
  }

  async _request(url: string, options: HttpRequestOptions) {
    if (url.includes('/tags') || url.includes('/entities')) {
      try {
        const { data } = await axios({
          url,
          method: options.method || 'get',
          headers: options.headers,
          params: options.params,
          data: options.data
        });
        return data;
      } catch (error: any) {
        console.error(`HTTP request failed for ${url}: ${error}`);
        throw error;
      }
    }

    if (this.cache) {
      const cachedData = await this.cache.get(url);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const { data } = await axios({
        url,
        method: options.method || 'get',
        headers: options.headers,
        params: options.params,
        data: options.data
      });

      // Cache the response
      await this.cache.set(url, data);
      return data;
    } catch (error: any) {
      console.error(`HTTP request failed for ${url}: ${error}`);
      throw error;
    }
  }

  // Function to make a GET request to the Postman API
  async getPostmanAPIData(id: string) {
    id = encodeURIComponent(id);
    return this._request(`${this.baseUrl}/apis/${id}?include=schemas,collections,versions,gitInfos`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  };

  async getPostmanAPISchema(id: string, schemaId: string) {
    id = encodeURIComponent(id);
    schemaId = encodeURIComponent(schemaId);
    return this._request(`${this.baseUrl}/apis/${id}/schemas/${schemaId}?bundled=true`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  }

  // Function to make a GET request to fetch the API versions from the Postman API
  async getPostmanAPIVersions(id: string) {
    id = encodeURIComponent(id);
    return this._request(`${this.baseUrl}/apis/${id}/versions`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  }

  // Function to make a GET request to fetch an API version from the Postman API
  async getPostmanAPIVersion(id: string, versionId: string) {
    id = encodeURIComponent(id);
    versionId = encodeURIComponent(versionId);
    return this._request(`${this.baseUrl}/apis/${id}/versions/${versionId}`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  };

  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getAllPostmanMonitorsData(workspaceId: string) {
    workspaceId = encodeURIComponent(workspaceId);
    return this._request(`${this.baseUrl}/monitors${workspaceId ? `?workspace=${workspaceId}` : ''}`, this.options);
  };

  // Function to make a GET request to fetch the collections for a given API from the Postman API based on collection id, uses minimal model for performance
  async getPostmanCollection(id: string) {
    id = encodeURIComponent(id);
    return this._request(`${this.baseUrl}/collections/${id}?model=minimal`, this.options);
  };

  // Function to make a GET request to fetch collections by tags from the Postman API
  // introduce optional parameter cursor for pagination
  async getPostmanCollectionsByTag(tag: string, cursor?: string) {
    tag = encodeURIComponent(tag);
    cursor = cursor ? encodeURIComponent(cursor) : cursor;
    return this._request(`${this.baseUrl}/tags/${tag}/entities?limit=50${cursor ? `&cursor=${cursor}` : ''}`, this.options);
  };

  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getPostmanAPIMonitorData(id: string) {
    id = encodeURIComponent(id);
    return this._request(`${this.baseUrl}/monitors/${id}`, this.options);
  };

  // Function to make a GET to fetch all tags of a collection
  async getCollectionTags(collectionId: string): Promise<string[]> {
    collectionId = encodeURIComponent(collectionId);
    const data = await this._request(`${this.baseUrl}/collections/${collectionId}/tags`, { ...this.options, headers: { ...this.options.headers, 'Accept': 'application/vnd.api.v10+json' } });
    const tags = data?.tags || [];
    return tags.map((tag: { slug: string }) => tag.slug);
  }

  async setCollectionTags(collectionId: string, tags: any): Promise<string[]> {
    collectionId = encodeURIComponent(collectionId);
    return this._request(`${this.baseUrl}/collections/${collectionId}/tags`, { ...this.options, method: 'put', data: JSON.stringify({ tags: tags }), headers: { ...this.options.headers, 'Content-Type': 'application/json' } });
  }

  // Function to make a GET to fetch all tags of an API
  async getAPITags(apiId: string): Promise<string[]> {
    apiId = encodeURIComponent(apiId);
    const data = await this._request(`${this.baseUrl}/apis/${apiId}/tags`, { ...this.options, headers: { ...this.options.headers, 'Accept': 'application/vnd.api.v10+json' } });
    const tags = data?.tags || [];
    return tags.map((tag: { slug: string }) => tag.slug);
  }

  // Function to make a GET request to fetch all Postman users in team
  async getAllPostmanUsers(): Promise<any> {
    return await this._request(`${this.baseUrl}/users`, this.options);
  }

  // Function to make a GET request to fetch all workspaces of a given Postman team
  async getAllPostmanWorkspaces(): Promise<any> {
    return await this._request(`${this.baseUrl}/workspaces?type=${this.collectionLinkerConfig.workspaceVisibility}`, this.options);
  }

  // Function to make a GET request to fetch a given workspace
  async getPostmanWorkspace(workspaceId: string): Promise<any> {
    return await this._request(`${this.baseUrl}/workspaces/${workspaceId}`, this.options);
  }
  
  // Function to make a GET request to fetch all Postman collections in team
  async getAllPostmanCollections(workspaceId: string): Promise<any> {
    return await this._request(`${this.baseUrl}/collections?workspace=${workspaceId}`, this.options);
  }

  // Function to make a GET request to fetch the collection linker status from the app-config
  async getCollectionLinkerStatus() {
    return {
      enabled: this.collectionLinkerConfig.enabled,
    }
  }

}
