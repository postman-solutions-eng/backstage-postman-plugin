import React from 'react';

// Backstage Components
import { MarkdownContent } from '@backstage/core-components';

// Assets
import RunInPostmanButton from './../../../assets/button.svg';

// Utils
import convertHtmlImageElementsToMarkdown from './../../../utils/markdownConverter';

// Material UI
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider, Link, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';


const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const APIView = ({ postmanContext }: { postmanContext: any }) => {

  const classes = useStyles();

  const { goUrl, postmanAPIData, collections } = postmanContext;

  const _collections = collections.filter((collection: any) => collection.collections.length > 0);

  return (
    <Box className={classes.root}>
      <Typography style={{ padding: '0px 0 10px' }} gutterBottom variant="body1" component="div">
        <b>Name: </b>{postmanAPIData?.name || ""}
      </Typography>
      <Divider />
      <Typography style={{ paddingTop: '10px' }} gutterBottom variant="body1" component="div">
        <b>Description:</b>
      </Typography>
      <MarkdownContent content={convertHtmlImageElementsToMarkdown(postmanAPIData?.description || "")} />
      {_collections?.length > 0 && (
        <>
          <Divider />
          <Typography style={{ paddingTop: '10px' }} gutterBottom variant="body1" component="div">
            <b>Collections:</b>
          </Typography>
          <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
            <List style={{ width: '100%', maxWidth: 360 }}>
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