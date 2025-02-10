// import {
//   mockCredentials,
//   startTestBackend,
// } from '@backstage/backend-test-utils';
// import { postmanBackendPlugin } from './plugin';
// import request from 'supertest';

// describe('plugin', () => {

//   it('should get API data by ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/apis/123');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({ id: '123', name: 'Test API' });
//   });

//   it('should get API versions by ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/apis/123/versions');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([{ version: '1.0.0' }, { version: '1.1.0' }]);
//   });

//   it('should get API version by ID and version ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/apis/123/versions/1.0.0');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({ version: '1.0.0', id: '123' });
//   });

//   it('should get all monitors', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/monitors');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([{ id: 'monitor1' }, { id: 'monitor2' }]);
//   });

//   it('should get monitor by ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/monitors/monitor1');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({ id: 'monitor1', name: 'Test Monitor' });
//   });

//   it('should get collection by ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/collections/collection1');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({ id: 'collection1', name: 'Test Collection' });
//   });

//   it('should get collections by tag', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/tags/test/entities');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([{ id: 'collection1', tag: 'test' }]);
//   });

//   it('should get all users', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/users');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([{ id: 'user1', name: 'Test User' }]);
//   });

//   it('should get all workspaces', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/workspaces');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual([{ id: 'workspace1', name: 'Test Workspace' }]);
//   });

//   it('should get a single workspace by ID', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server).get('/postman/workspace/workspace1');

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({ id: 'workspace1', name: 'Test Workspace' });
//   });

//   it('should return 401 for unauthenticated requests', async () => {
//     const { server } = await startTestBackend({
//       features: [postmanBackendPlugin],
//     });

//     const response = await request(server)
//       .get('/postman/apis/123')
//       .set('Authorization', mockCredentials.none.header());

//     expect(response.status).toBe(401);
//   });
// });
