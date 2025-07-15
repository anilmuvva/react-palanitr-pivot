import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Refresh, ExpandMore } from '@mui/icons-material';

const ControlSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: '24px',
}));

interface ControlPanelProps {
  scenario: string;
  setScenario: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  orderDetails: {
    sps: boolean;
    commit: boolean;
    pr: boolean;
  };
  setOrderDetails: (details: { sps: boolean; commit: boolean; pr: boolean }) => void;
  onRefresh: () => void;
}

export default function ControlPanel({
  scenario,
  setScenario,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  orderDetails,
  setOrderDetails,
  onRefresh,
}: ControlPanelProps) {
  const handleOrderDetailChange = (type: 'sps' | 'commit' | 'pr') => {
    setOrderDetails({
      ...orderDetails,
      [type]: !orderDetails[type],
    });
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        {/* Scenario Selection */}
        <ControlSection>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
            SELECT SCENARIO
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select an option...</MenuItem>
              <MenuItem value="PROD">PROD</MenuItem>
              <MenuItem value="TEST">TEST</MenuItem>
              <MenuItem value="DEV">DEV</MenuItem>
            </Select>
          </FormControl>
        </ControlSection>

        {/* Status Information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Latest Shipped LX
            </Typography>
            <Typography variant="caption">Jul 15, 2025, 3:18 AM</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Latest Onhand LX
            </Typography>
            <Typography variant="caption">Jul 15, 2025, 3:12 AM</Typography>
          </Box>
          <StatusChip 
            label="Current Scenario: PROD" 
            color="primary" 
            variant="outlined" 
            size="small"
          />
        </Box>

        {/* Date Inputs */}
        <ControlSection>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
            START DATE
          </Typography>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </ControlSection>

        <ControlSection>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
            DUE DATE
          </Typography>
          <TextField
            type="date"
            size="small"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            sx={{ minWidth: 150 }}
          />
        </ControlSection>

        {/* Refresh Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={onRefresh}
          sx={{ ml: 'auto' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Order Details Section */}
      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Order Details
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={orderDetails.sps}
                onChange={() => handleOrderDetailChange('sps')}
                size="small"
              />
            }
            label="sps"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={orderDetails.commit}
                onChange={() => handleOrderDetailChange('commit')}
                size="small"
              />
            }
            label="commit"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={orderDetails.pr}
                onChange={() => handleOrderDetailChange('pr')}
                size="small"
              />
            }
            label="pr"
          />

          <Select
            size="small"
            value="daily"
            sx={{ ml: 'auto', minWidth: 100 }}
          >
            <MenuItem value="daily">daily</MenuItem>
            <MenuItem value="weekly">weekly</MenuItem>
            <MenuItem value="monthly">monthly</MenuItem>
          </Select>
        </Box>
      </Box>
    </Paper>
  );
}