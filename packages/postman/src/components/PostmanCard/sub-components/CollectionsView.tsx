import React from 'react';

// Material UI
import Pagination from '@mui/material/Pagination';
import { Box, Divider, Typography } from '@material-ui/core';

// Backkstage Markdown Component
import { MarkdownContent } from '@backstage/core-components';

// Assets
import RunInPostmanButton from './../../../assets/button.svg';

// Utils
import convertHtmlImageElementsToMarkdown from './../../../utils/markdownConverter';

const CollectionsView = ({ postmanContext }: { postmanContext: any }) => {

  const [page, setPage] = React.useState(1);

  const { goUrl, collections } = postmanContext;

  const [_collection, setCollection] = React.useState<any>(collections[0]);
  const [pagination] = React.useState(collections.length > 1 && postmanContext?.postman?.collections?.pagination === 'true');

  const onNextPage = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setCollection(collections[value - 1]);
  };

  return (
    <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
      {pagination ? (
        <>{collections.length > 0 && (
          <>
            <Box style={{ width: '100%' }}>
              <Typography style={{ padding: '20px 0 10px' }} gutterBottom variant="body1" component="div">
                <b>Name: </b>{_collection.name}
              </Typography>
              <MarkdownContent content={convertHtmlImageElementsToMarkdown(_collection.description || "")} />
              <a href={`https://${goUrl}/collection/${_collection.uid}`} target="_blank" rel="noopener">
                <img src={RunInPostmanButton} alt="Run in Postman" />
              </a>
            </Box>
          </>
        )}
          <Pagination sx={{ mt: 4 }} count={collections.length} page={page} onChange={onNextPage} />
        </>
      ) : (
        <>
          {collections.map((collection: any, index: number) => (
            <>
              <Box key={index} style={{ width: '100%' }}>
                <Typography style={{ padding: '20px 0 10px' }} gutterBottom variant="body1" component="div">
                  <b>Name: </b>{collection.name}
                </Typography>
                <MarkdownContent content={convertHtmlImageElementsToMarkdown(collection.description || "")} />
                <a href={`https://${goUrl}/collection/${collection.uid}`} target="_blank" rel="noopener">
                  <img src={RunInPostmanButton} alt="Run in Postman" />
                </a>
              </Box>
              {((index + 1) !== collections.length) && (
                <Divider style={{ width: '100%', margin: '15px 0 5px' }} />
              )}
            </>
          ))}
        </>
      )}
    </Box>
  );
};

export default CollectionsView;