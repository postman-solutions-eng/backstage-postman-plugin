'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var backendCommon = require('@backstage/backend-common');
var express = require('express');
var Router = require('express-promise-router');
var axios = require('axios');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var express__default = /*#__PURE__*/_interopDefaultLegacy(express);
var Router__default = /*#__PURE__*/_interopDefaultLegacy(Router);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class PostmanService {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    __publicField(this, "options", {
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.options.headers["X-Api-Key"] = this.apiKey;
  }
  // Function to make a GET request to the Postman API
  async getPostmanAPIData(id) {
    try {
      const { data } = await axios__default["default"].get(`${this.baseUrl}/apis/${id}?include=schemas,collections,versions,gitInfos`, { ...this.options, headers: { ...this.options.headers, "Accept": "application/vnd.api.v10+json" } });
      return data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch the API versions from the Postman API
  async getPostmanAPIVersions(id) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/apis/${id}/versions`, { ...this.options, headers: { ...this.options.headers, "Accept": "application/vnd.api.v10+json" } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch an API version from the Postman API
  async getPostmanAPIVersion(id, versionId) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/apis/${id}/versions/${versionId}`, { ...this.options, headers: { ...this.options.headers, "Accept": "application/vnd.api.v10+json" } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getAllPostmanMonitorsData(workspaceId) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/monitors${workspaceId ? `?workspace=${workspaceId}` : ""}`, this.options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch the collections for a given API from the Postman API based on collection id
  async getPostmanCollection(id) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/collections/${id}`, this.options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch collections by tags from the Postman API
  async getPostmanCollectionsByTag(tag) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/tags/${tag}/entities`, this.options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // Function to make a GET request to fetch the API monitor data from the Postman API
  async getPostmanAPIMonitorData(id) {
    try {
      const response = await axios__default["default"].get(`${this.baseUrl}/monitors/${id}`, this.options);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

async function createRouter(options) {
  var _a, _b;
  const { logger, config } = options;
  const router = Router__default["default"]();
  router.use(express__default["default"].json());
  const checkForAPIKey = (req, res, next) => {
    if (res.statusCode === 401) {
      res.status(401).json({ error: "No API key provided" });
    } else {
      next();
    }
  };
  const baseUrl = (_a = config == null ? void 0 : config.getString("postman.baseUrl")) != null ? _a : "";
  const apiKey = (_b = config == null ? void 0 : config.getString("postman.apiKey")) != null ? _b : "";
  const postmanService = new PostmanService(baseUrl, apiKey);
  router.get("/apis/:id", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanAPIData(req.params.id);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/apis/:id/versions", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanAPIVersions(req.params.id);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/apis/:id/versions/:versionId", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanAPIVersion(req.params.id, req.params.versionId);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/monitors", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getAllPostmanMonitorsData(req.query.workspace ? req.query.workspace.toString() : "");
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/monitors/:id", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanAPIMonitorData(req.params.id);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/monitors/:workspaceId", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getAllPostmanMonitorsData(req.params.workspaceId);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/collections/:id", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanCollection(req.params.id);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error: error.message });
    }
  });
  router.get("/tags/:tag/entities", checkForAPIKey, async (req, res) => {
    try {
      const data = await postmanService.getPostmanCollectionsByTag(req.params.tag);
      res.json(data);
    } catch (error) {
      logger.error(error);
      res.status(res.statusCode).json({ error });
    }
  });
  router.use(backendCommon.errorHandler());
  return router;
}

exports.createRouter = createRouter;
//# sourceMappingURL=index.cjs.js.map
