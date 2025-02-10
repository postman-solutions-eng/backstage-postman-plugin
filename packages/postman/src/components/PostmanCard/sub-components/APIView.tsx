import React from 'react';

// Backstage Components
import { useTheme } from '@material-ui/core/styles';
import { MarkdownContent, UserIcon } from '@backstage/core-components';

// Assets
import RunInPostmanButton from './../../../../assets/button.svg';

// Utils
import convertHtmlImageElementsToMarkdown from '../../../utils/markdownConverter';

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import { Box, Card, CardContent, Divider, Grid, Link, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => {
  const backstageTheme = useTheme();
  return {
    root: {
      padding: theme.spacing(2),
    },
    headerGrid: {
      color: 'rgba(255, 255, 255, 0.7)',
      overflow: 'hidden',
      fontSize: backstageTheme.typography.overline.fontSize,
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      marginTop: '10px'
    },
    bodyGrid: {
      overflow: 'hidden',
      wordBreak: 'break-word',
      fontWeight: 'bold',
      lineHeight: '24px',
      fontSize: backstageTheme.typography.body1.fontSize
    },
    bodyGridLink: {
      marginLeft: '5px',
      fontSize: backstageTheme.typography.body1.fontSize,
      fontWeight: 400,
      lineHeight: 1.43
    }
  };
});

const APIView = ({ postmanContext, height }: { postmanContext: any, height: any }) => {

  const classes = useStyles();

  const { goUrl, postmanAPIData, collections, users } = postmanContext;

  const _collections = collections.filter((collection: any) => collection.collections.length > 0);
  const user = users.find((_user: any) => _user.id === parseInt(postmanAPIData?.createdBy, 10)) ?? { name: null };

  return (
    <Box className={classes.root}>
      <Card style={{ boxShadow: 'none' }}>
        <CardContent style={{ padding: '10px 0px 20px' }}>
          <Grid container spacing={2}>
            {postmanAPIData?.name && (
              <Grid item xs={6} sm={postmanAPIData?.gitInfo && postmanAPIData?.gitInfo?.organization ? 3 : 8}>
                <Typography variant="overline" className={classes.headerGrid}>
                  Name:
                </Typography>
                <Typography variant="body1" className={classes.bodyGrid}>
                  {postmanAPIData?.name}
                </Typography>
              </Grid>
            )}
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
            {postmanAPIData?.gitInfo && postmanAPIData?.gitInfo?.organization && (
              <Grid item xs={6} sm={5}>
                <Typography variant="overline" className={classes.headerGrid}>
                  Connected Git Repository:
                </Typography>
                <Typography variant="body1" className={classes.bodyGridLink}>
                  <Link href={`https://${goUrl}/api/${postmanContext.postman.api.id}`} target="_blank" rel="noopener">
                    {postmanAPIData?.gitInfo?.domain && `${postmanAPIData?.gitInfo?.domain}/`}{postmanAPIData?.gitInfo?.organization && `${postmanAPIData?.gitInfo?.organization}/` || ""}{postmanAPIData?.gitInfo?.repository || ""}
                  </Link>
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Divider />
      <Typography style={{ paddingTop: '10px' }} className={classes.headerGrid}>
        <b>Description:</b>
      </Typography>
      <Box style={{ ...height && { maxHeight: height, overflowY: 'auto' } }}>
        <MarkdownContent content={convertHtmlImageElementsToMarkdown(postmanAPIData?.description || "")} />
      </Box>
      {_collections?.length > 0 && (
        <>
          <Divider />
          <Typography style={{ paddingTop: '10px' }} className={classes.headerGrid}>
            <b>Collections:</b>
          </Typography>
          <Box style={{ display: 'flex', flexWrap: 'wrap', maxHeight: 300, overflow: 'auto' }}>
            <List style={{ width: '100%' }}>
              {collections?.map((collection: any, i: number) => (
                <React.Fragment key={`${i}'_collection'}`}>
                  {collection.collections.map((item: any, index: number) => (
                    <React.Fragment key={item.id + index}>
                      <ListItem>
                        <ListItemText
                          primary={item.name}
                          secondary={
                            <React.Fragment>
                              <b>{collection.version}</b>
                            </React.Fragment>
                          }
                        />
                        <ListItemAvatar>
                          <Link href={`https://${goUrl}/api/${postmanContext.postman.api.id}?version=${collection.versionId}`} target="_blank" rel="noopener">
                            <img src={RunInPostmanButton} alt="View in Postman" />
                          </Link>
                        </ListItemAvatar>
                      </ListItem>
                    </ React.Fragment>
                  ))}

                </ React.Fragment>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
};

export default APIView;