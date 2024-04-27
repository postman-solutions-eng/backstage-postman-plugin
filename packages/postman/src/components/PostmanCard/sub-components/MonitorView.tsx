import React from 'react';

// Material UI
import Alert from '@mui/material/Alert';
import DoneIcon from '@material-ui/icons/Done';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Tooltip, Typography } from '@material-ui/core';

const MonitorView = ({ postmanContext }: { postmanContext: any }): any => {

const { goUrl, APIHealth } = postmanContext;

  const formattedDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box>
      {APIHealth &&
        <Box style={{ marginTop: '1em' }}>
          <Alert icon={APIHealth.monitor.lastRun.status === 'passed' ? <DoneIcon fontSize="inherit" /> : ''} severity={APIHealth.monitor.lastRun.status === 'failed' ? 'error' : 'success'}>
            <b>API {APIHealth.monitor.lastRun.status === 'failed' ? 'Unhealthy' : 'Healthy'}&nbsp;
              <Tooltip title={`${APIHealth.monitor.lastRun.stats.assertions.failed} failed test${APIHealth.monitor.lastRun.stats.assertions.failed > 1 ? 's' : ''}.`}>
                <InfoIcon style={{ fontSize: 14 }} />
              </Tooltip>
            </b>
            <Typography variant="body2" style={{ fontSize: 12 }} component="div">
              Postman monitor: <b>{APIHealth.monitor.name}</b>
            </Typography>
            <Typography variant="body2" style={{ fontSize: 12 }} component="div">
              Last run: <b>{formattedDate(APIHealth.monitor.lastRun.finishedAt)}</b>
            </Typography>
            {APIHealth?.monitor?.id && (
              <Typography variant="body2" style={{ fontSize: 12 }} component="div">
                <a style={{ textDecoration: 'underline' }} target='_blank' href={`https://${goUrl}/monitor/${APIHealth?.monitor?.id}`}>View monitor</a>
              </Typography>
            )}
          </Alert>
        </Box>
      }
    </Box>
  );
};

export default MonitorView;
