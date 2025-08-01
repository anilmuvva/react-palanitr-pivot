import React, { useState } from "react";
import { Box, IconButton, Collapse, Typography, Paper } from "@mui/material";
import FilterPanel from "./FilterPanel";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CollapsibleFilterPanelProps {
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

const CollapsibleFilterPanel: React.FC<CollapsibleFilterPanelProps> = (props) => {
  const [open, setOpen] = useState(true);
  return (
    <Paper elevation={2} sx={{ height: '100%', overflow: 'hidden', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setOpen((prev) => !prev)} size="small">
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <FilterPanel {...props} />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CollapsibleFilterPanel;