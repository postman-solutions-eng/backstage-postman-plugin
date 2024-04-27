import React from 'react';
import { Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  MarkdownContent,
} from '@backstage/core-components';

import APIView from './../../examples/images/api.png';
import MonitorView from './../../examples/images/monitor.png';
import CollectionView from './../../examples/images/collections.png';

const ReadMe = `
This plugin offers several views which you can use to display published API information stored in Postman, show collections with a *Run In Postman* button and allows you to view your Postman monitor results on the API page.

## API View 

Displays your published Postman API data in Backstage, allowing you to access both the API information and the published API collections.

![Postman API View](${APIView})

Refer to the [Postman API Metadata](https://github.com/postman-solutions-eng/backstage-demo/tree/main/plugins/postman#apis) to see the parameters needed to display this view.

## Collections View 

Displays the collection(s) of a given API stored in Postman. This view includes a *Run in Postman* button, which is activated based on the collection ID(s) or tag defined in the 'entities.yaml' file.

![Postman Collection View](${CollectionView})

Refer to the [Postman Collections Metadata](https://github.com/postman-solutions-eng/backstage-demo/tree/main/plugins/postman#collections-use-collection-tag-or-ids) to see the parameters needed to display this view.

### Monitor View 

Shows the health of your API as determined by the monitor in Postman. The monitor can be displayed using either its 'name' or 'id'. 

![Postman Monitor View](${MonitorView})

For more details, refer to [this section](https://github.com/postman-solutions-eng/backstage-demo/tree/main/plugins/postman#monitors-use-monitor-id-or-name).

## Coming soon 

A *Governance Checks* view will be added in future versions of this plugin.
`;

export const MainComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to the Postman plugin page!" subtitle="A backstage plugin designed to demonstrate how Postman can be integrated in Bacjstage to manage APIs and streamline development workflows.">
      <HeaderLabel label="Owner" value="Postman Solutions" />
      <HeaderLabel label="Lifecycle" value="Production" />
    </Header>
    <Content>
      <ContentHeader title="Postman" />
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Plugin Views">
            <MarkdownContent content={ReadMe} />
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
