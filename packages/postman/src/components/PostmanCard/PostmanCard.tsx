import React, { useEffect, useState } from 'react';

// Backstage Components
import { ANNOTATION_VIEW_URL, EntityMeta } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { BottomLink, InfoCard, MarkdownContent } from '@backstage/core-components';

// Postman icon
import postmanIcon from './../../assets/postman.svg';

// Material UI Components
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { makeStyles } from '@material-ui/core/styles';
import { Box, CardContent, Typography } from '@material-ui/core';

// Postman Services
import { PostmanService } from '../../service/PostmanServices';

// Postman components
import CollectionsView from './sub-components/CollectionsView';
import MonitorView from './sub-components/MonitorView';
import APIView from './sub-components/APIView';

const useStyles = makeStyles(() => ({
  root: {
    // Add your styles here
  },
  MuiButton: {
    primary: {
      colour: 'white',
      backgroundColor: 'orange'
    }
  }
}));

export function PostmanCard({ height }: { height?: number }) {

  const config = useApi(configApiRef);
  const baseUrl = config.getString('backend.baseUrl');

  const { entity } = useEntity();

  const apiType = entity.spec?.type || "";

  // State management
  const [loading, setLoading] = useState(true);
  const [APIHealth, setAPIHealth] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [postmanAPIData, setPostmanAPIData] = useState<any>();
  const [_error, setError] = useState<any>({
    state: false,
    message: ''
  });

  // State to manage the Postman context
  const [postmanContext] = useState<any>(processPostmanMetadata(entity.metadata));

  useEffect(() => {
    (async () => {
      try {
        const PostmanServiceInstance = new PostmanService(baseUrl);
        const context = processPostmanMetadata(entity.metadata);
        if (context?.postman?.api?.id) {
          const data = await PostmanServiceInstance.getPostmanAPIData(context.postman.api.id);

          setPostmanAPIData(data);
          if (data?.versions && data.versions.length > 0) {
            const APIVersions = await PostmanServiceInstance.getPostmanAPIVersions(data.id);
            const versions = APIVersions.versions;
            const _collections = [];
            for await (const version of versions) {
              const response = await PostmanServiceInstance.getPostmanAPIVersion(context.postman.api.id, version.id);
              _collections.push({ collections: response.collections, version: response.name, versionId: version.id });
              setCollections(_collections);
            }
            setCollections(_collections);
          }
          if ((apiType === 'rest' || apiType === 'openapi') && context?.postman?.api?.name) {
            const monitors = await PostmanServiceInstance.getAllPostmanMonitorsData('');
            const APIMonitor = monitors.monitors.find((monitor: any) => monitor.name === context.postman.api.name);
            if (APIMonitor && APIMonitor?.id) {
              const monitorData = await PostmanServiceInstance.getPostmanAPIMonitorData(APIMonitor.id);
              setAPIHealth(monitorData);
            }
          }
          setLoading(false);
        } else {
          if ((apiType === 'rest' || apiType === 'openapi') && context.postman?.monitor?.id) {
            const monitorData = await PostmanServiceInstance.getPostmanAPIMonitorData(context.postman?.monitor?.id);
            setAPIHealth(monitorData);
          } else if ((apiType === 'rest' || apiType === 'openapi') && context.postman?.monitor?.name) {
            if (context.postman?.workspace?.id) {
              const monitors = await PostmanServiceInstance.getAllPostmanMonitorsData(context.postman.workspace.id);
              const APIMonitor = monitors.monitors.find((monitor: any) => monitor.name === context.postman.monitor.name);
              if (APIMonitor) {
                const monitorData = await PostmanServiceInstance.getPostmanAPIMonitorData(APIMonitor.id);
                setAPIHealth(monitorData);
              }
            } else {
              const monitors = await PostmanServiceInstance.getAllPostmanMonitorsData('');
              const APIMonitor = monitors.monitors.find((monitor: any) => monitor.name === context.postman.monitor.name);
              if (APIMonitor) {
                const monitorData = await PostmanServiceInstance.getPostmanAPIMonitorData(APIMonitor.id);
                setAPIHealth(monitorData);
              }
            }
          }

          if (context.postman?.collections || context.postman?.collection) {
            const _collections = [];

            if (context.postman?.collection?.id) {
              const response = await PostmanServiceInstance.getPostmanCollection(context.postman.collection.id);
              _collections.push({ ...response.collection.info, id: response.collection.info._postman_id });
            }

            if (context.postman?.collections?.ids) {
              for await (const collection of context.postman.collections.ids) {
                const response = await PostmanServiceInstance.getPostmanCollection(collection);
                _collections.push({ ...response.collection.info, id: response.collection.info._postman_id });
              }
              setCollections(_collections);
            }

            if (context.postman?.collections?.tag) {
              const response = await PostmanServiceInstance.getPostmanCollectionsByTag(context.postman.collections.tag);
              if (response?.meta?.count > 0) {
                for await (const collection of response.data.entities
                  .filter((_entity: any) => _entity.entityType === 'collection')) {
                  const data = await PostmanServiceInstance.getPostmanCollection(collection.entityId);
                  _collections.push({ ...data.collection.info, id: data.collection.info._postman_id });
                }
                setCollections(_collections);
              }
            }
          }
          setLoading(false);
          return;
        }
      } catch (error: any) {
        setError({ state: true, message: error.message });
        setLoading(false);
      }
    })();
  }, [baseUrl, apiType, entity.metadata]);

  const classes = useStyles();

  return (
    <InfoCard className={classes.root}>
      <Typography style={{ display: 'inline-flex', margin: '16px 16px 0' }} gutterBottom variant="h5" component="div">
        <img style={{ marginRight: '10px', width: '100%', height: '35px' }} alt='Postman Logo' src={postmanIcon} />
      </Typography>
      <CardContent style={{
        ...height && { height: `${height}px`, overflowY: 'scroll' },
      }}>
        {postmanContext.postman && !_error.state ? (
          <>
            {loading ? (
              <Box sx={{ pt: 0.5, pb: '1em' }}>
                <Skeleton />
                <Skeleton width="60%" />
              </Box>
            ) : (
              <>
                {(entity.spec?.type === 'rest' || entity.spec?.type === 'openapi') && (
                  <>
                    <MonitorView postmanContext={{ ...postmanContext, APIHealth }} />
                  </>
                )}
                {postmanContext?.postman?.api?.id && (
                  <>
                    <APIView postmanContext={{ ...postmanContext, postmanAPIData, collections }} />
                  </>
                )}
                {!postmanContext.postman.api && postmanContext?.postman?.collections && (
                  <>
                    <CollectionsView postmanContext={{ ...postmanContext, collections }} />
                  </>
                )}
              </>
            )}
            {postmanContext?.postman?.api?.id && (
              <>
                <BottomLink link={`https://${postmanContext?.goUrl}/api/${postmanContext.postman.api.id}`} title='View API In Postman' />
              </>
            )}
          </>
        ) : (
          <>

            <Alert sx={{ mt: 2 }} severity='error'>
              {_error.state ? (
                <MarkdownContent content={_error.message} />
              ) : (
                "This API asset doesn't exist in Postman, or your API may lack the necessary Postman metadata."
              )}
            </Alert>
          </>
        )}
      </CardContent>
    </InfoCard >
  );
};

function processPostmanMetadata(metadata: EntityMeta): any {
  const postmanData: { [key: string]: any } = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (key.startsWith('postman/')) {
      const keys = key.split('/');
      let currentObj: { [key: string]: any } = postmanData;

      keys.forEach((nestedKey, index) => {
        if (index === keys.length - 1) {
          currentObj[nestedKey] = value;
        } else {
          currentObj[nestedKey] = currentObj[nestedKey] || {};
          currentObj = currentObj[nestedKey];
        }
      });
    }
  });

  postmanData.goUrl = metadata.annotations?.[ANNOTATION_VIEW_URL]?.split('/')[2] ?? 'go.postman.co';
  
  if (!postmanData.goUrl.endsWith('.co')) {
    postmanData.goUrl = 'go.postman.co';
  }

  return postmanData;
}
