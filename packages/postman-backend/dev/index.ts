import { createBackend } from '@backstage/backend-defaults';
// import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// This is the development setup for your plugin that wires up a
// minimal backend that can use both real and mocked plugins and services.
//
// Start up the backend by running `yarn start` in the package directory.
// Once it's up and running, try out the following requests:
//
// Create a new collection:
//
//   curl http://localhost:7007/api/postman-backend/collections -H 'Content-Type: application/json' -d '{"name": "My Collection"}'
//
// List collections:
//
//   curl http://localhost:7007/api/postman-backend/collections
//
// Create a new request in a collection:
//
//   curl http://localhost:7007/api/postman-backend/collections/{collectionId}/requests -H 'Content-Type: application/json' -d '{"name": "My Request", "method": "GET", "url": "http://example.com"}'
//
// List requests in a collection:
//
//   curl http://localhost:7007/api/postman-backend/collections/{collectionId}/requests

const backend = createBackend();

// backend.add(mockServices.auth.factory());
// backend.add(mockServices.httpAuth.factory());

backend.add(
  catalogServiceMock.factory({
    entities: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'sample',
          title: 'Sample Component',
        },
        spec: {
          type: 'service',
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
