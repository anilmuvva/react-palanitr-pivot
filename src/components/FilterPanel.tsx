import {
  Box,
  Paper,
  Typography,
  TextField,
  Autocomplete
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
  partName: string[];
  setPartName: (value: string[]) => void;
  partNameOptions: string[];
  fileNumber: string[];
  setFileNumber: (value: string[]) => void;
  fileNumberOptions: string[];
  spsPart: string[];
  setSpsPart: (value: string[]) => void;
  spsPartOptions: string[];
  spsStatus: string[];
  setSpsStatus: (value: string[]) => void;
  spsStatusOptions: string[];
  orderSiteValue: string;
  setOrderSiteValue: (value: string) => void;
  productionLine: string[];
  setProductionLine: (value: string[]) => void;
  productionLineOptions: string[];
}

export default function FilterPanel({
  partName,
  setPartName,
  partNameOptions,
  fileNumber,
  setFileNumber,
  fileNumberOptions,
  spsPart,
  setSpsPart,
  spsPartOptions,
  spsStatus,
  setSpsStatus,
  spsStatusOptions,
  productionLine,
  setProductionLine,
  productionLineOptions,
}: FilterPanelProps) {


  return (
    <Box>
      <FilterSection>
        <FilterLabel>PART NAME</FilterLabel>
        <Autocomplete
          multiple
          options={partNameOptions}
          value={partName}
          onChange={(_, value) => setPartName(value)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" placeholder="Select part name(s)" />
          )}
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>FILE NUMBER</FilterLabel>
        <Autocomplete
          multiple
          options={fileNumberOptions}
          value={fileNumber}
          onChange={(_, value) => setFileNumber(value)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" placeholder="Select file number(s)" />
          )}
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>SPS PART</FilterLabel>
        <Autocomplete
          multiple
          options={spsPartOptions}
          value={spsPart}
          onChange={(_, value) => setSpsPart(value)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" placeholder="Select sps part(s)" />
          )}
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>SPS STATUS</FilterLabel>
        <Autocomplete
          multiple
          options={spsStatusOptions}
          value={spsStatus}
          onChange={(_, value) => setSpsStatus(value)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" placeholder="Select sps status(es)" />
          )}
        />
      </FilterSection>

      <FilterSection>
        <FilterLabel>PRODUCTION LINE</FilterLabel>
        <Autocomplete
          multiple
          options={productionLineOptions}
          value={productionLine}
          onChange={(_, value) => setProductionLine(value)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" size="small" placeholder="Select production line(s)" />
          )}
        />
      </FilterSection>
    </Box>
  );
}