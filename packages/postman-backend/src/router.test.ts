// import {
//   mockCredentials,
//   mockErrorHandler,
//   mockServices,
// } from "@backstage/backend-test-utils";
// import express from "express";
// import request from "supertest";

// import { createRouter } from "./router";

// import { PostmanService } from "./services/postman";

// describe("createRouter", () => {
//   let app: express.Express;
//   let postmanService: jest.Mocked<PostmanService>;

//   beforeEach(async () => {
//     postmanService = {
//       getPostmanAPIData: jest.fn(),
//       getPostmanAPIVersions: jest.fn(),
//       getPostmanAPIVersion: jest.fn(),
//       getAllPostmanMonitorsData: jest.fn(),
//       getPostmanAPIMonitorData: jest.fn(),
//       getPostmanCollection: jest.fn(),
//       getPostmanCollectionsByTag: jest.fn(),
//       getAllPostmanUsers: jest.fn(),
//       getAllPostmanWorkspaces: jest.fn(),
//       getPostmanWorkspace: jest.fn(),
//       _request: jest.fn(),
//       getPostmanAPISchema: jest.fn(),
//       getCollectionTags: jest.fn(),
//       getAPITags: jest.fn(),
//       getAllPostmanCollections: jest.fn(),
//       baseUrl: "",
//       apiKey: "",
//       cache: {
//         get: jest.fn(),
//         set: jest.fn(),
//         delete: jest.fn(),
//       },
//       options: {} as any,
//     } as unknown as jest.Mocked<PostmanService>;
//     const router = await createRouter({
//       httpAuth: mockServices.httpAuth(),
//       postmanService,
//     });
//     app = express();
//     app.use(router);
//     app.use(mockErrorHandler());
//   });

//   it("should get API data by ID", async () => {
//     const mockData = { id: "123", name: "Test API" };
//     postmanService.getPostmanAPIData.mockResolvedValue(mockData);

//     const response = await request(app).get("/apis/123");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get API versions by ID", async () => {
//     const mockData = [{ version: "1.0.0" }, { version: "1.1.0" }];
//     postmanService.getPostmanAPIVersions.mockResolvedValue(mockData);

//     const response = await request(app).get("/apis/123/versions");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get API version by ID and version ID", async () => {
//     const mockData = { version: "1.0.0", id: "123" };
//     postmanService.getPostmanAPIVersion.mockResolvedValue(mockData);

//     const response = await request(app).get("/apis/123/versions/1.0.0");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get all monitors", async () => {
//     const mockData = [{ id: "monitor1" }, { id: "monitor2" }];
//     postmanService.getAllPostmanMonitorsData.mockResolvedValue(mockData);

//     const response = await request(app).get("/monitors");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get monitor by ID", async () => {
//     const mockData = { id: "monitor1", name: "Test Monitor" };
//     postmanService.getPostmanAPIMonitorData.mockResolvedValue(mockData);

//     const response = await request(app).get("/monitors/monitor1");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get collection by ID", async () => {
//     const mockData = { id: "collection1", name: "Test Collection" };
//     postmanService.getPostmanCollection.mockResolvedValue(mockData);

//     const response = await request(app).get("/collections/collection1");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get collections by tag", async () => {
//     const mockData = [{ id: "collection1", tag: "test" }];
//     postmanService.getPostmanCollectionsByTag.mockResolvedValue(mockData);

//     const response = await request(app).get("/tags/test/entities");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get all users", async () => {
//     const mockData = [{ id: "user1", name: "Test User" }];
//     postmanService.getAllPostmanUsers.mockResolvedValue({ data: mockData });

//     const response = await request(app).get("/users");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get all workspaces", async () => {
//     const mockData = [{ id: "workspace1", name: "Test Workspace" }];
//     postmanService.getAllPostmanWorkspaces.mockResolvedValue(mockData);

//     const response = await request(app).get("/workspaces");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

//   it("should get a single workspace by ID", async () => {
//     const mockData = { id: "workspace1", name: "Test Workspace" };
//     postmanService.getPostmanWorkspace.mockResolvedValue(mockData);

//     const response = await request(app).get("/workspace/workspace1");

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockData);
//   });

// });
