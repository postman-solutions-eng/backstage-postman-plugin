// Axios for making HTTP requests
import axios from 'axios';

// Backstage cache service
import { CacheClient } from '@backstage/backend-common';

interface HttpRequestOptions {
  method?: 'get' | 'post' | 'put' | 'delete';
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  data?: any;
}

export class PostmanService {

  private readonly cache: CacheClient;

  private options: any = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  constructor(private baseUrl: string, private apiKey: string, cache: CacheClient) {
    this.cache = cache;
    this.options.headers['X-Api-Key'] = this.apiKey;
  }

  async _request(url: string, options: HttpRequestOptions) {
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

      await this.cache?.set(url, data);
      return data;
    } catch (error: any) {
      console.error(`HTTP request failed for ${url}: ${error}`);
      throw error;
    }
  };

  // Function to make a GET request to the Postman API
  async getPostmanAPIData(id: string) {
    return this._request(`${this.baseUrl}/apis/${id}?include=schemas,collections,versions,gitInfos`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  };

  async getPostmanAPISchema(id: string, schemaId: string) {
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
    return this._request(`${this.baseUrl}/apis/${id}/versions`, {
      ...this.options,
      headers: {
        ...this.options.headers,
        'Accept': 'application/vnd.api.v10+json'
      }
    });
  };

  // Function to make a GET request to fetch an API version from the Postman API
  async getPostmanAPIVersion(id: string, versionId: string) {
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
    return this._request(`${this.baseUrl}/monitors${workspaceId ? `?workspace=${workspaceId}` : ''}`, this.options);
  };

  // Function to make a GET request to fetch the collections for a given API from the Postman API based on collection id, uses minimal model for performance
  async getPostmanCollection(id: string) {
    return this._request(`${this.baseUrl}/collections/${id}?model=minimal`, this.options);
  };

  // Function to make a GET request to fetch collections by tags from the Postman API
  // introduce optional parameter cursor for pagination
  async getPostmanCollectionsByTag(tag: string, cursor?: string) {
    return this._request(`${this.baseUrl}/tags/${tag}/entities${cursor ? `?cursor=${cursor}` : ''}`, this.options);
  };

  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getPostmanAPIMonitorData(id: string) {
    return this._request(`${this.baseUrl}/monitors/${id}`, this.options);
  };

  // Function to fetch all tags of a collection
  async getCollectionTags(collectionId: string): Promise<string[]> {
    // Make a GET request to fetch the tags for the given collection
    const data = await this._request(`${this.baseUrl}/collections/${collectionId}/tags`, { ...this.options, headers: { ...this.options.headers, 'Accept': 'application/vnd.api.v10+json' } });

    // Extract the tags
    const tags = data?.tags || [];

    // Map the tags array to get the slugs and return it
    return tags.map((tag: { slug: string }) => tag.slug);
  }

  // Function to fetch all tags of an API
  async getAPITags(apiId: string): Promise<string[]> {
    // Make a GET request to fetch the tags for the given API
    const data = await this._request(`${this.baseUrl}/apis/${apiId}/tags`, { ...this.options, headers: { ...this.options.headers, 'Accept': 'application/vnd.api.v10+json' } });

    // Extract the tags
    const tags = data?.tags || [];

    // Map the tags array to get the slugs and return it
    return tags.map((tag: { slug: string }) => tag.slug);
  }

}
