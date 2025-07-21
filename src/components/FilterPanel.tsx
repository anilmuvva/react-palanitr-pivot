import {
  Box,
  Paper,
  Typography,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const FilterLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  textTransform: 'uppercase',
}));

interface FilterPanelProps {
  partName: string;
  setPartName: (value: string) => void;
  fileNumber: string;
  setFileNumber: (value: string) => void;
  spsStatus: string[];
  setSpsStatus: (value: string[]) => void;
  orderSiteValue: string;
  setOrderSiteValue: (value: string) => void;
  productionLine: string;
  setProductionLine: (value: string) => void;
}

export default function FilterPanel({
  partName,
  setPartName,
  fileNumber,
  setFileNumber,
  spsStatus,
  setSpsStatus,
  orderSiteValue,
  setOrderSiteValue,
  productionLine,
  setProductionLine,
}: FilterPanelProps) {
  const handleSpsStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.trim() === '') {
      // If empty, reset to default values
      setSpsStatus(['AO', 'Firm', 'Pending', 'Available', 'Reserved']);
    } else {
      // Split by comma and trim whitespace
      const statusArray = value.split(',').map(status => status.trim()).filter(status => status !== '');
      setSpsStatus(statusArray);
    }
  };

  // Convert array back to comma-separated string for display
  const spsStatusDisplayValue = spsStatus.join(', ');

  return (
    <Paper elevation={1} sx={{ p: 2, width: 300, height: 'fit-content' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        🔍 Filters
      </Typography>

      <FilterSection>
        <FilterLabel>PART NAME</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={partName}
          onChange={(e) => setPartName(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>FILE NUMBER</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={fileNumber}
          onChange={(e) => setFileNumber(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>SPS STATUS</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter comma-separated values (e.g., AO, Firm, Pending)"
          variant="outlined"
          value={spsStatusDisplayValue}
          onChange={handleSpsStatusChange}
          helperText="Leave empty to use default values (AO, Firm, Pending, Available, Reserved)"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>ORDER SITE VALUE</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={orderSiteValue}
          onChange={(e) => setOrderSiteValue(e.target.value)}
          variant="outlined"
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>PRODUCTION LINE</FilterLabel>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={productionLine}
          onChange={(e) => setProductionLine(e.target.value)}
          variant="outlined"
        />
      </FilterSection>
    </Paper>
  );
}