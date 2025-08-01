import {
  Box,
  Paper,
  Typography,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Select
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';
import { Refresh } from '@mui/icons-material';

const ControlSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

// const StatusChip = styled(Chip)(() => ({
//   fontSize: '0.75rem',
//   height: '24px',
// }));

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
  dateBucket: 'daily' | 'weekly' | 'monthly' | 'yearly';
  setDateBucket: (bucket: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  onRefresh: () => void;
}

export default function ControlPanel({
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  orderDetails,
  setOrderDetails,
  dateBucket,
  setDateBucket,
  onRefresh,
}: ControlPanelProps) {
  const handleOrderDetailChange = (type: 'sps' | 'commit' | 'pr') => {
    setOrderDetails({
      ...orderDetails,
      [type]: !orderDetails[type],
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={1} sx={{ p: 2, mb: 2, mx: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {/* Scenario Selection */}
          {/* <ControlSection>
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
          </ControlSection> */}

          {/* Status Information */}
          {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
          </Box> */}

          {/* Date Inputs - Both in same row */}
          <ControlSection>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              START DATE
            </Typography>
            <DatePicker
              format="YYYY-MM-DD"
              value={dayjs(startDate)}
              onChange={(date: Dayjs | null) => {
                if (date) setStartDate(date.format('YYYY-MM-DD'));
              }}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              DUE DATE
            </Typography>
            <DatePicker
              format="YYYY-MM-DD"
              value={dayjs(dueDate)}
              onChange={(date: Dayjs | null) => {
                if (date) setDueDate(date.format('YYYY-MM-DD'));
              }}
              slotProps={{ textField: { size: 'small', sx: { minWidth: 150 } } }}
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
              value={dateBucket}
              onChange={(e) => setDateBucket(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
              sx={{ ml: 'auto', minWidth: 100 }}
            >
              <MenuItem value="daily">daily</MenuItem>
              <MenuItem value="weekly">weekly</MenuItem>
              <MenuItem value="monthly">monthly</MenuItem>
              <MenuItem value="yearly">yearly</MenuItem>
            </Select>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}