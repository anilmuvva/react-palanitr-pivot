import React, { useState } from "react";
import { Box, IconButton, Collapse, Typography, Paper, Tooltip } from "@mui/material";
import FilterPanel from "./FilterPanel";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';

interface CollapsibleFilterPanelProps {
  open: boolean;
  onToggle: (open: boolean) => void;
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

const CollapsibleFilterPanel: React.FC<CollapsibleFilterPanelProps> = ({ 
  open, 
  onToggle, 
  ...filterProps 
}) => {
  return (
    <>
      {/* Collapsed state - show only toggle button */}
      {!open && (
        <Box sx={{ 
          position: 'absolute', 
          left: 0, 
          top: '50%', 
          transform: 'translateY(-50%)',
          zIndex: 1000,
          backgroundColor: 'background.paper',
          borderRadius: '0 8px 8px 0',
          boxShadow: 2,
          width: 'auto'
        }}>
          <Tooltip title="Show Filters" placement="right">
            <IconButton 
              onClick={() => onToggle(true)} 
              size="small"
              sx={{ 
                p: 1.5,
                borderRadius: '0 8px 8px 0'
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      {/* Expanded state - show full panel */}
      {open && (
        <Paper elevation={2} sx={{ 
          height: '100%', 
          overflow: 'hidden', 
          width: '100%',
          minWidth: 320,
          position: 'relative'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            px: 2, 
            py: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon fontSize="small" />
              Filters
            </Typography>
            <Tooltip title="Hide Filters">
              <IconButton onClick={() => onToggle(false)} size="small">
                <ExpandLessIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ 
            height: 'calc(100% - 56px)', 
            overflow: 'auto',
            px: 2, 
            py: 2 
          }}>
            <FilterPanel {...filterProps} />
          </Box>
        </Paper>
      )}
    </>
  );
};

export default CollapsibleFilterPanel;