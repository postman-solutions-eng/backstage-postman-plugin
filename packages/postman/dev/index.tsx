import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { postmanPlugin, PostmanPage } from '../src/plugin';

createDevApp()
  .registerPlugin(postmanPlugin)
  .addPage({
    element: <PostmanPage />,
    title: 'Root Page',
    path: '/postman'
  })
  .render();
