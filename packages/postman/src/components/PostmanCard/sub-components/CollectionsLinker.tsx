import React, { useState, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';

// Postman Services
import { PostmanService } from '../../../service/PostmanServices';

// Backkstage Components
import { useApi, configApiRef } from '@backstage/core-plugin-api';

// Material UI
import Alert from '@mui/material/Alert';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import {
  Typography,
  Divider,
  TextField,
  Box,
  Button,
  CircularProgress
} from '@material-ui/core';
import { styled } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';

// Material Accordion
import MuiAccordionSummary, {
  AccordionSummaryProps,
  accordionSummaryClasses,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

// Postman Components
import CollectionsView from './CollectionsView';
import Skeleton from '@mui/material/Skeleton';

// Workspace Visibility Icons
import TeamWorkspaceIcon from '../../../../assets/TeamWorkspaceIcon';
import PublicWorkspaceIcon from '../../../../assets/PublicWorkspaceIcon';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  flexDirection: 'row-reverse',
  borderRadius: '4px',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.background.paper,
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
  {
    transform: 'rotate(90deg)',
  },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1)
  },
  [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
    fontWeight: 500
  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: '20px',
  borderRadius: '0 0 4px 4px',
  [`& h6`]: {
    fontSize: theme.typography.h6.fontSize,
    marginBottom: '20px'
  },
  backgroundColor: theme.palette.background.default
}));


const CollectionsLinker = ({ backstageAPIContext, postmanContext, users, height }: { backstageAPIContext: any, postmanContext: any, users: any, height: any }) => {
  const theme = useTheme();

  const config = useApi(configApiRef);
  const baseUrl = config.getString('backend.baseUrl');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [collectionLoader, setCollectionLoader] = useState(false);
  const [collectionLinkerConsent, setCollectionLinkerConsent] = useState<boolean>(false);
  const [collectionLinkLoader, setCollectionLinkLoader] = useState(false);
  const [linkCollectionConsent, setLinkCollectionConsent] = useState<boolean>(false);

  const [error, setError] = useState<boolean>(false);

  const [apiName] = useState(backstageAPIContext.metadata.name || '');

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>();
  const [selectedCollection, setSelectedCollection] = useState<any>([]);

  const [linkedCollections, setLinkedCollections] = useState<any[]>([]);

  const snackbarDismisser = (_event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    if (error) {
      setError(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const PostmanServiceInstance = new PostmanService(baseUrl);
      const _workspaces = await PostmanServiceInstance.getAllPostmanWorkspaces();
      setWorkspaces(_workspaces.workspaces);
      setLoading(false);
    } catch (_error: any) {
      setError(_error);
    }
  };

  const fetchCollectionsForWorkspace = async (workspaceId: string) => {
    try {
      const PostmanServiceInstance = new PostmanService(baseUrl);
      const _workspace = await PostmanServiceInstance.getAllPostmanCollections(workspaceId);
      const _collections = _workspace.collections;
      setSelectedWorkspace({ id: workspaceId, collections: _collections });
      setCollectionLoader(false);
    } catch (_error: any) {
      setError(_error);
    }
  };

  const fetchCollectionDetails = async (collectionId: string) => {
    try {
      const PostmanServiceInstance = new PostmanService(baseUrl);
      const _collection = await PostmanServiceInstance.getPostmanCollection(collectionId);
      return _collection.collection;
    } catch (_error: any) {
      setError(_error);
      return null;
    }
  };

  useEffect(() => {
    const PostmanServiceInstance = new PostmanService(baseUrl);

    const fetchCollections = async () => {
      try {
        const collectionLinkerStatus = await PostmanServiceInstance.getCollectionLinkerStatus();
        setCollectionLinkerConsent(collectionLinkerStatus.enabled);
        if (!collectionLinkerStatus.enabled) {
          setLoading(false);
          return;
        }
        const { data } = await PostmanServiceInstance.getPostmanCollectionsByTag(`backstage-plugin-${apiName}-tag`);
        const entities = data.entities;

        const collectionPromises = entities
          .filter((entity: any) => entity.entityType === 'collection')
          .map((entity: any) => PostmanServiceInstance.getPostmanCollection(entity.entityId));

        const collectionsData = await Promise.all(collectionPromises);
        const _collections = collectionsData.map((_data: any) => _data.collection.info);

        setCollections(_collections);
        setLoading(false);
      } catch (_error: any) {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [apiName, baseUrl]);

  const [expanded, setExpanded] = React.useState<string | false>('collectionLinker');

  const accordionStateChange = (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const linkCollectionWithTag = async (_selectedCollection: any) => {
    try {
      const PostmanServiceInstance = new PostmanService(baseUrl);
      const collectionTags = await PostmanServiceInstance.getPostmanCollectionTags(_selectedCollection.uid);

      let tags = [];
      if (collectionTags.length > 0) {
        tags = collectionTags.map((tag: string) => {
          return {
            "slug": tag
          }
        });
      }

      tags.push({
        "slug": `backstage-plugin-${apiName}-tag`
      });

      await PostmanServiceInstance.setCollectionTags(_selectedCollection.uid, tags);
      setLinkedCollections([...linkedCollections, _selectedCollection]);
      setCollections([_selectedCollection, ...collections]);
      setSelectedWorkspace([]);
      setSnackbarMessage('Collection linked successfully');
      setSnackbarOpen(true);
      setExpanded(false);
    } catch (_error: any) {
      setError(true);
      setCollectionLinkLoader(false);
      setSnackbarMessage('There was an error with linking your collection to your API. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const updateCollections = (_collections: any, info: any) => {
    setCollections(_collections);
    if (info.error) {
      setError(true);
    }
    setSnackbarMessage(info.message);
    setSnackbarOpen(true);
  };

  return (
    <Box>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={snackbarDismisser}>
        <MuiAlert onClose={snackbarDismisser} severity={error ? `error` : `success`}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
      {loading ? (
        <Box style={{ marginTop: '20px' }}>
          <Skeleton />
          <Skeleton width="60%" />
        </Box>
      ) : (
        <>
          {collections.length === 0 && (
            <>
              <Alert sx={{ mt: 2 }} severity='error'>
                This API is not linked to any assets in Postman. Please ensure your API contains the necessary metadata or use the collection linker feature below.
              </Alert>
              {!linkCollectionConsent && collectionLinkerConsent && (
                <Box style={{ marginTop: '20px' }}>
                  <Button variant="contained" color="primary" onClick={() => {
                    fetchWorkspaces();
                    setLinkCollectionConsent(!linkCollectionConsent);
                  }}>
                    Link collections to this API
                  </Button>
                </Box>
              )}
            </>
          )}
          {linkCollectionConsent && (
            <>
              {loading ? (
                <Box style={{ marginTop: '20px' }}>
                  <Skeleton />
                  <Skeleton width="60%" />
                </Box>
              ) : (
                <>
                  <Accordion style={{ margin: '20px 0 5px' }} expanded={expanded === 'collectionLinker'} onChange={accordionStateChange('collectionLinker')}>
                    <AccordionSummary aria-controls="collectionLinker-content">
                      <Typography component="span">Collection Linker</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box style={{ marginBottom: '20px' }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          The collection linker will only return team and public workspaces created in your Postman team.
                        </Alert>
                      </Box>
                      <Box>
                        <Typography variant="h6">1. Select a workspace</Typography>
                        <Autocomplete
                          style={{ width: '100%', marginBottom: '20px' }}
                          options={workspaces}
                          autoHighlight
                          getOptionLabel={(option: any) => option.name}
                          onChange={(_event, newValue: any) => {
                            if (newValue) {
                              setCollectionLoader(true);
                              fetchCollectionsForWorkspace(newValue.id);
                            }
                          }}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                              <Box
                                key={option.id}
                                component="li"
                                {...optionProps}
                              >
                                {option.visibility === 'team' && (
                                  <TeamWorkspaceIcon color={theme.palette.text.primary} />
                                )}
                                {option.visibility === 'public' && (
                                  <PublicWorkspaceIcon color={theme.palette.text.primary} />
                                )}
                                <Typography variant='body2'>{option.name}</Typography>
                              </Box>
                            );
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Choose a workspace"
                              variant="outlined" size='small'
                            />
                          )}
                        />
                        {collectionLoader && !selectedWorkspace?.collections && (
                          <CircularProgress style={{ margin: '20px 0' }} />
                        )}
                        {selectedWorkspace?.collections && (
                          <>
                            <Typography variant="h6">2. Select a collection</Typography>
                            <Autocomplete
                              style={{ width: '100%', marginBottom: '20px' }}
                              options={selectedWorkspace.collections}
                              getOptionLabel={(option: any) => option.name}
                              onChange={(_event, newValue: any) => {
                                fetchCollectionDetails(newValue.uid).then((data: any) => {
                                  setSelectedCollection(data.info);
                                });
                              }}
                              renderOption={(props, option) => {
                                const { key, ...optionProps } = props;
                                return (
                                  <Box
                                    key={option.uid}
                                    component="li"
                                    {...optionProps}
                                  >
                                    <Typography variant='body2'>{option.name}</Typography>
                                  </Box>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Choose a collection"
                                  variant="outlined" size='small'
                                />
                              )}
                            />
                            <Button disabled={selectedCollection.length === 0 && collectionLinkLoader} style={{ margin: '10px 0' }} variant="contained" color="primary" onClick={() => {
                              setCollectionLinkLoader(true);
                              linkCollectionWithTag(selectedCollection);
                              setSelectedCollection([]);
                            }}>Link{collectionLinkLoader && ('ing')} {(linkedCollections.length > 0 && !collectionLinkLoader) && 'another'} collection</Button>
                          </>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  {collections.length > 0 && (
                    <Divider style={{ margin: '20px 0' }} />
                  )}
                </>
              )}
            </>
          )}
          {collections.length > 0 && (
            <>
              <Box>
                <CollectionsView postmanContext={{ ...postmanContext, collections }} collectionLinker apiName={apiName} users={users} height={height || 'auto'} updateCollections={updateCollections} />
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CollectionsLinker;