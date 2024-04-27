/* eslint-disable no-console */
import axios from 'axios';

export class PostmanService {

  constructor(private baseUrl: string,) {
  }

  errorCatcher(error: any) {
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes('401')) {
      return '**Missing Postman API Key.** Please add a Postman API Key to your **app-config.yaml** file. More information can be found [here]("https://github.com/postman-solutions-eng/backstage-demo/tree/main/plugins/postman#getting-started").';
    } else if (errorMessage.includes('403')) {
      return 'Please make sure your **Postman API key** is valid and has the necessary permissions.';
    } else if (errorMessage.includes('404')) {
      return '404 - Not Found';
    } else if (errorMessage.includes('500')) {
      return 'Internal Server Error';
    } else if (errorMessage.includes('502')) {
      return 'Bad Gateway';
    } else if (errorMessage.includes('503')) {
      return 'Service Unavailable';
    } else if (errorMessage.includes('504')) {
      return 'Gateway Timeout';
    }
    return error;
  }

  // Function to make a GET request to the Postman API
  async getPostmanAPIData(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/apis/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch the API versions from the Postman API
  async getPostmanAPIVersions(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/apis/${id}/versions`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch an API version from the Postman API
  async getPostmanAPIVersion(id: string, versionId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/apis/${id}/versions/${versionId}`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getAllPostmanMonitorsData(workspaceId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/monitors${workspaceId ? `?workspace=${workspaceId}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch the collections for a given API from the Postman API based on collection id
  async getPostmanCollection(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/collections/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };


  // Function to make a GET request to fetch collections by tags from the Postman API
  async getPostmanCollectionsByTag(tag: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/tags/${tag}/entities`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getPostmanAPIMonitorData(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/monitors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

  // Function to make a GET request to fetch the API governance data from the Postman API
  async getPostmanGovernanceData() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/postman/data`);
      return response.data;
    } catch (error) {
      throw new Error(this.errorCatcher(error));
    }
  };

}