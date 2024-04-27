import React from 'react';

// Material UI
import Alert from '@mui/material/Alert';
import DoneIcon from '@mui/icons-material/Done';


const GovernanceView = () => {


  return (
    <Alert style={{ marginTop: '1em' }} icon={<DoneIcon fontSize="inherit" />} severity="success">
      API Governance checks
    </Alert>
  );
};

export default GovernanceView;