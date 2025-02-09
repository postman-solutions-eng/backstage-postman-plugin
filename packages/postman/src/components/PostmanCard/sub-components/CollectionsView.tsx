import React from 'react';

// Postman Services
import { PostmanService } from '../../../service/PostmanServices';

// Material UI
import Pagination from '@mui/material/Pagination';
import { Box, Divider, Typography, Link, Grid, Card, CardContent, Button } from '@material-ui/core';

// Backkstage Components
import { useTheme } from '@material-ui/core/styles';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { MarkdownContent, UserIcon } from '@backstage/core-components';

// Assets
import RunInPostmanButton from './../../../../assets/button.svg';

// Utils
import { makeStyles } from '@material-ui/core/styles';
import convertHtmlImageElementsToMarkdown from '../../../utils/markdownConverter';
import Alert from '@mui/material/Alert';

const useStyles = makeStyles(() => {
  const backstageTheme = useTheme();
  return {
    headerGrid: {
      color: 'rgba(255, 255, 255, 0.7)',
      overflow: 'hidden',
      fontSize: '10px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    bodyGrid: {
      overflow: 'hidden',
      wordBreak: 'break-word',
      fontWeight: 'bold',
      lineHeight: '24px',
      fontSize: backstageTheme.typography.overline.fontSize,
    },
    bodyGridLink: {
      marginLeft: '5px',
      fontSize: backstageTheme.typography.overline.fontSize,
      fontWeight: 400,
      lineHeight: 1.43
    }
  }
});

const ContextView = ({ users, collection, runInPostmanLink, collectionLinker, apiName, updateCollections }: { users: any, collection: any, runInPostmanLink: string, collectionLinker?: boolean, apiName?: string, updateCollections: (collection: any, message: any) => void }) => {
  const classes = useStyles();
  const config = useApi(configApiRef);
  const baseUrl = config.getString('backend.baseUrl');
  
  const user = users.find((_user: any) => _user.id === parseInt(collection?.lastUpdatedBy, 10)) ?? { name: null };

  const [submitting, setSubmitting] = React.useState(false);

  const unlinkCollection = async (collectionId: string) => {
    const PostmanServiceInstance = new PostmanService(baseUrl);
    const collectionTags = await PostmanServiceInstance.getPostmanCollectionTags(collectionId);
    if (collectionTags.length > 0) {
      const _tags = collectionTags.map((tag: string) => {
        return {
          "slug": tag
        }
      });
      const filteredTags = _tags.filter((tag: any) => tag.slug !== `backstage-plugin-${apiName}-tag`);
      try {
        const data: any = await PostmanServiceInstance.setCollectionTags(collectionId, filteredTags);
        if (data?.tags) {
            updateCollections(collectionId, { error: false, message: 'Collection unlinked successfully' });
        }
        setSubmitting(false);
      } catch (_error: any) {
        updateCollections(collectionId, { error: true, 'message': `Failed to set collection tags: ${JSON.stringify(_error)}` });
      }

    }
  };

  return (
    <>
      <>
        <Card style={{ boxShadow: 'none' }}>
          <CardContent style={{ padding: '10px 0px 20px' }}>
            <Grid container spacing={2}>
              {collectionLinker === true && (
                <Grid item xs={6} sm={12}>
                  <Button disabled={submitting} variant="contained" color="secondary" onClick={() => {
                    setSubmitting(true);
                    unlinkCollection(collection.uid);
                  }}>Unlink collection</Button>
                </Grid>
              )}
              <Grid item xs={6} sm={5}>
                <Typography variant="overline" className={classes.headerGrid}>
                  Collection Name:
                </Typography>
                <Typography variant="body1" className={classes.bodyGrid}>
                  {collection.name}
                </Typography>
              </Grid>
              {user.name && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="overline" className={classes.headerGrid}>
                    Last Updated By:
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <UserIcon fontSize="small" />
                    <Typography variant="body1" className={classes.bodyGridLink}>
                      <Link href={`https://go.postman.co/users/${user.id}`} target="_blank" rel="noopener noreferrer">
                        {user.name}
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={6} sm={3}>
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <a href={runInPostmanLink} target="_blank" rel="noopener">
                    <img src={RunInPostmanButton} alt="Run in Postman" />
                  </a>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Divider style={{ marginBottom: '20px' }} />
      </>
    </>
  );
};

const CollectionsView = ({ postmanContext, users, height, collectionLinker, apiName, updateCollections }: { postmanContext: any, users: any, height: any, collectionLinker?: boolean, apiName?: string, updateCollections: (collection: any, message: string) => void }) => {

  const classes = useStyles();

  const [page, setPage] = React.useState(1);

  const { goUrl } = postmanContext;

  const [collections, setCollections] = React.useState(postmanContext?.collections || []);
  const [_collection, setCollection] = React.useState<any>(postmanContext?.collections[0]);
  const [pagination, setPagination] = React.useState(postmanContext?.collections.length > 1);

  React.useEffect(() => {
    setCollections(postmanContext?.collections || []);
    setCollection(postmanContext?.collections[0]);
    setPagination(postmanContext?.collections.length > 1);
  }, [postmanContext]);

  const onNextPage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setCollection(collections[value - 1]);
  };

  const updateCollectionsAtSource = (collection: any, message: any) => {
    if (message.error) {
      return;
    }
    const _collections = collections.filter((_c: any) => _c.uid !== collection);
    setCollections(_collections);
    updateCollections(_collections, message);
    setCollection(_collections[0]);
    setPagination(_collections.length > 1);
  };

  return (
    <Box style={{ display: 'flex', marginTop: '10px', flexWrap: 'wrap', width: '100%' }}>
      {collectionLinker && (
        <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
          This collection was linked using the collection linker feature.
        </Alert>
      )}
      {pagination ? (
        <>
          {collections.length > 0 && (
            <>
              <Box style={{ width: '100%' }}>
                <ContextView users={users} collection={_collection} runInPostmanLink={`https://${goUrl}/collection/${_collection.uid}`} collectionLinker={collectionLinker ?? false} apiName={apiName} updateCollections={updateCollectionsAtSource} />
                {_collection.description && _collection.description !== "" && (
                  <>
                    <Typography style={{ padding: '0 0 10px' }} className={classes.headerGrid}>
                      <b>Description:</b>
                    </Typography>
                    <Box style={{ ...(height ? { maxHeight: `${typeof height === 'number' ? `${height}px` : height}`, overflowY: 'scroll' } : {}) }}>
                      <MarkdownContent content={convertHtmlImageElementsToMarkdown(_collection.description || "")} />
                    </Box>
                  </>
                )}
              </Box>
            </>
          )}
          <Pagination style={{ marginTop: '20px', zIndex: '99' }} count={collections.length} page={page} onChange={onNextPage} />
        </>
      ) : (
        <>
          {collections.map((collection: any, index: number) => (
            <React.Fragment key={index + collection.uid}>
              <Box style={{ width: '100%' }}>
                <ContextView users={users} collection={collection} runInPostmanLink={`https://${goUrl}/collection/${collection.uid}`} collectionLinker={collectionLinker ?? false} apiName={apiName} updateCollections={updateCollectionsAtSource} />
                {collection.description && collection.description !== "" && (
                  <>
                    <Typography style={{ padding: '0 0 10px' }} className={classes.headerGrid}>
                      <b>Description:</b>
                    </Typography>
                    <Box style={{ ...(height ? { maxHeight: `${typeof height === 'number' ? `${height}px` : height}`, overflowY: 'scroll' } : {}) }}>
                      <MarkdownContent content={convertHtmlImageElementsToMarkdown(collection.description || "")} />
                    </Box>
                  </>
                )}
              </Box>
              {((index + 1) !== collections.length) && (
                <Divider style={{ width: '100%', margin: '15px 0 5px' }} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </Box>
  );
};

export default CollectionsView;