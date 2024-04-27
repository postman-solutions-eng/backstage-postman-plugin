import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const postmanPlugin = createPlugin({
  id: 'postman',
  routes: {
    root: rootRouteRef,
  },
});

export const PostmanCard = postmanPlugin.provide(
  createRoutableExtension({
    name: 'PostmanCard',
    component: () =>
      import('./components/PostmanCard/PostmanCard').then(m => m.PostmanCard),
    mountPoint: rootRouteRef,
  }),
);

export const PostmanPage = postmanPlugin.provide(
  createRoutableExtension({
    name: 'PostmanPage',
    component: () =>
      import('./components/MainComponent').then(m => m.MainComponent),
    mountPoint: rootRouteRef,
  }),
);
