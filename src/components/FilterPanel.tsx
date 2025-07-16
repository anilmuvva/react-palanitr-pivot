import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Chip,
  FormControl,
  Select,
  OutlinedInput,
  SelectChangeEvent,
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

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
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

const spsStatusOptions = ['AO', 'Firm', 'Pending', 'Available', 'Reserved'];

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
  const handleSpsStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSpsStatus(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDeleteChip = (chipToDelete: string) => {
    setSpsStatus(spsStatus.filter((chip) => chip !== chipToDelete));
  };

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
        <FormControl fullWidth size="small">
          <Select
            multiple
            value={spsStatus}
            onChange={handleSpsStatusChange}
            input={<OutlinedInput />}
            displayEmpty
            renderValue={() => null}
          >
            {spsStatusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ChipContainer>
          {spsStatus.map((status) => (
            <Chip
              key={status}
              label={status}
              onDelete={() => handleDeleteChip(status)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </ChipContainer>
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