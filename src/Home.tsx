/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useMemo } from "react";
import { DevSpsOrderLine as SpsOrderLine, devConsolidatedFunctionBackedPivotTableSPS as consolidatedFunctionBackedPivotTableSPS, devGetFilteredScheduledDemandAsync, devfunctionBackedModifySpsQty, devAddSpsOrCommit, DevScheduledDemandByDate, DevSpsOrderLine } from "@dev-sps-scheduling/sdk";
import client from "./client";
import Layout from "./Layout";
//import FilterPanel from "./components/FilterPanel";
import ControlPanel from "./components/ControlPanel";
import { DataGrid } from '@mui/x-data-grid';
import { GridColDef } from '@mui/x-data-grid/models';
import { Box, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';
import type { Osdk } from "@osdk/client";
import CollapsibleFilterPanel from "./components/CollapsibleFilterPanel";

// Types
interface OrderDetails {
  sps: boolean;
  commit: boolean;
  pr: boolean;
}

interface PivotParams {
  orderLines: any;
  startDate: string;
  dueDate: string;
  selectedScenarioName: string;
  types: string[];
  grouping: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface FilterOptions {
  partName: string[];
  fileNumber: string[];
  spsPart: string[];
  spsStatus: string[];
  productionLine: string[];
}

// Constants
const DEFAULT_SPS_STATUS = ['AO', 'Firm', 'Pending', 'Available', 'Reserved'];
const BASE_COLUMN_ORDER = [
  { field: "site", headerName: "Site" },
  { field: "source", headerName: "Source" },
  { field: "part", headerName: "Part" },
  { field: "accountManagerInitial", headerName: "AM" },
  { field: "carType", headerName: "Car Type" },
  { field: "comments", headerName: "Comments" },
  { field: "endCustomer", headerName: "Customer" },
  { field: "onHand", headerName: "OnHand" },
  { field: "orderQuantityTotal", headerName: "Qty Total" },
  { field: "totalShippedQuantity", headerName: "Shipped" },
  { field: "totalQuantityDiff", headerName: "Total Qty Diff" },
  { field: "qty_type", headerName: "Type" },
] as const;

function Home() {
  // Filter panel collapse state
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    partName: [],
    fileNumber: [],
    spsPart: [],
    spsStatus: DEFAULT_SPS_STATUS,
    productionLine: [],
  });
  const [orderSiteValue, setOrderSiteValue] = useState('');

  // Control states
  const [scenario, setScenario] = useState('');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'));
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    sps: true,
    commit: true,
    pr: false,
  });
  const [dateBucket, setDateBucket] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

  // Pivot table states
  const [pivotRows, setPivotRows] = useState<any[]>([]);
  const [pivotLoading, setPivotLoading] = useState(false);
  const [pivotColumns, setPivotColumns] = useState<GridColDef[]>([]);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    partName: [],
    fileNumber: [],
    spsPart: [],
    spsStatus: [],
    productionLine: [],
  });

  // Helper functions
  const getRowKey = useCallback((row: Record<string, unknown>) => {
    const { /* date, values, */ ...rest } = row;
    const filteredRest: Record<string, unknown> = {};
    BASE_COLUMN_ORDER.forEach(col => {
      filteredRest[col.field] = rest[col.field];
    });
    return JSON.stringify(filteredRest);
  }, []);

  const buildFilterQuery = useCallback(() => {
    const baseFilter = {
      $and: [
        filters.spsPart.length > 0 
          ? { spsPart: { $in: filters.spsPart } } 
          : { spsPart: { $eq: "Y" } },
        filters.spsStatus.length > 0 
          ? { spsStatus: { $in: filters.spsStatus } } 
          : { spsStatus: { $in: DEFAULT_SPS_STATUS } }
      ]
    };

    const additionalFilters: any[] = [];
    
    if (filters.partName.length > 0) {
      additionalFilters.push({ partName: { $in: filters.partName } });
    }
    
    if (filters.fileNumber.length > 0) {
      additionalFilters.push({ fileNumber: { $in: filters.fileNumber } });
    }
    
    if (orderSiteValue.trim()) {
      additionalFilters.push({ orderSiteValue: { $contains: orderSiteValue.trim() } });
    }
    
    if (filters.productionLine.length > 0) {
      additionalFilters.push({ productionLine: { $in: filters.productionLine } });
    }

    let filteredOrderLines = client(SpsOrderLine).where(baseFilter);
    
    if (additionalFilters.length > 0) {
      filteredOrderLines = filteredOrderLines.where({ $and: additionalFilters });
    }

    return filteredOrderLines;
  }, [filters, orderSiteValue]);

  const updateFilterOptions = useCallback((filteredOrderLinesArray: Osdk.Instance<SpsOrderLine>[]) => {
    const getUniqueValues = (field: keyof Osdk.Instance<SpsOrderLine>) => 
      Array.from(new Set(
        filteredOrderLinesArray
          .map(r => String(r[field] ?? ""))
          .filter(Boolean)
      ));

    setFilterOptions({
      partName: getUniqueValues('partName'),
      fileNumber: getUniqueValues('fileNumber'),
      spsPart: getUniqueValues('spsPart'),
      spsStatus: getUniqueValues('spsStatus'),
      productionLine: getUniqueValues('source'), // Note: using source for productionLine
    });
  }, []);

  const processPivotData = useCallback((flatRows: Array<Record<string, unknown>>) => {
    // Get all unique dates and sort them
    const allDates = Array.from(new Set(flatRows.map((r) => r.date as string))).sort();

    // Group by all fields except date and values.quantity
    const rowMap = new Map<string, Record<string, unknown>>();
    
    flatRows.forEach((row) => {
      const key = getRowKey(row);
      if (!rowMap.has(key)) {
        rowMap.set(key, { ...JSON.parse(key), id: rowMap.size + 1 });
      }
      
      // Set the quantity for this date
      const date = row.date as string;
      const quantity = (row.values && typeof row.values === 'object' && 'quantity' in row.values) 
        ? (row.values as { quantity?: number }).quantity 
        : null;
      rowMap.get(key)![date] = quantity ?? null;
    });
    
    const processedRows = Array.from(rowMap.values());
    
    // Sort by Site asc, Part asc, Source desc
    processedRows.sort((a, b) => {
      const siteA = String(a.site ?? "");
      const siteB = String(b.site ?? "");
      if (siteA !== siteB) return siteA < siteB ? -1 : 1;
      
      const partA = String(a.part ?? "");
      const partB = String(b.part ?? "");
      if (partA !== partB) return partA < partB ? -1 : 1;
      
      const sourceA = String(a.source ?? "");
      const sourceB = String(b.source ?? "");
      return sourceA < sourceB ? 1 : -1;
    });

    return { rows: processedRows, dates: allDates };
  }, [getRowKey]);

  const buildPivotColumns = useCallback((dates: string[]): GridColDef[] => [
    ...BASE_COLUMN_ORDER.map(col => ({
      field: col.field,
      headerName: col.headerName,
      width: 120,
      sortable: true,
      pinned: 'left' as const, // Pin base columns
      disableColumnMenu: false,
      menuIconButtonProps: {
        style: { marginLeft: 'auto' }
      }
    })),
    ...dates.map(date => ({
      field: date,
      headerName: dayjs(date).isValid() ? dayjs(date).format('MM/DD/YY') : date,
      width: 110,
      minWidth: 90,
      maxWidth: 140,
      sortable: true,
      type: 'number' as const,
      align: 'right' as const,
      headerAlign: 'right' as const,
      editable: true, // Make date columns editable
      disableColumnMenu: false,
      menuIconButtonProps: {
        style: { marginLeft: 'auto' }
      },
      headerClassName: 'custom-header',
      // Do not pin date columns
    }))
  ], []);

  // Existing handler for cell edit commit (not used directly now)
  const handleCellEditCommit = useCallback(async (params: any) => {
    // Only handle edits for date columns (not base columns)
    const isBaseColumn = BASE_COLUMN_ORDER.some(col => col.field === params.field);
    if (isBaseColumn) return;

    const selectedDate = params.field;
    const rowData = pivotRows.find(r => r.id === params.id) || {};

    // Build orderLines query (reuse buildFilterQuery)
    const orderLinesQuery = buildFilterQuery();

    const options = {
      part: rowData.part || "",
      site: rowData.site || "",
      source: rowData.source || "",
      carType: rowData.carType || "",
    };

    try {
      // 1. Call devGetFilteredScheduledDemandAsync with startDate and dueDate from control panel
      const scheduledDemandResult: any[] = await client(devGetFilteredScheduledDemandAsync).executeFunction({
        orderLines: orderLinesQuery,
        startDate,
        dueDate,
        options
      });
      console.log('Filtered Scheduled Demand (edit) - raw result:', scheduledDemandResult);

      // 2. Filter the result list for the selected cell date
      let scheduledDemandByDate: any = null;
      // Log all dueDateString values for debugging
      scheduledDemandResult.forEach(item => {
        console.log(`Due date string: ${item.dueDateString}`);
      });
      const match = scheduledDemandResult.find(item => item.dueDateString === selectedDate);
      if (match) {
        scheduledDemandByDate = match.scheduledDemand;
      }
      console.log('Filtered scheduledDemandByDate for cell:', scheduledDemandByDate);

      // 3. Prepare other values
      const partName = rowData.part || "";
      const cellValue = params.row[selectedDate];
      const scenarioValue = scenario || "PROD";

      if (scheduledDemandByDate) {
        // 4. Call devfunctionBackedModifySpsQty and log the result
        const modifyResult = await client(devfunctionBackedModifySpsQty).applyAction(
          {
            scheduledDemandByDate,
            partName,
            dueDate: selectedDate,
            newTotalQuantity: cellValue,
            //newCommitQty: cellValue,
            scenario: scenarioValue,
          },
          { $returnEdits: true }
        );
        console.log('devfunctionBackedModifySpsQty result:', modifyResult);
        if (modifyResult.type === "edits") {
          const updatedObject = modifyResult.editedObjectTypes[0];
          console.log("Updated object", updatedObject);
        }
      } else {
        // 5. If not found, call devAddSpsOrCommit to create it
        // Try to link to DevSpsOrderLine from any scheduledDemand object
        let spsOrderLine = null;
        if (scheduledDemandResult.length > 0 && scheduledDemandResult[0].scheduledDemand) {
          try {
            // Get the full DevScheduledDemandByDate object by primary key
            const primaryKey = scheduledDemandResult[0].scheduledDemand.$primaryKey;
            console.log('Fetching full DevScheduledDemandByDate object with primaryKey:', primaryKey);
            const response = await client(DevScheduledDemandByDate).fetchOneWithErrors(primaryKey);
            console.log('Fetched DevScheduledDemandByDate object:', response);
            if (response?.value?.$link?.spsOrderLine) {
              spsOrderLine = await response.value.$link.spsOrderLine.fetchOneWithErrors();
              console.log('Fetched linked spsOrderLine:', spsOrderLine);
            } else {
              console.warn('No spsOrderLine link found in fetched DevScheduledDemandByDate object');
            }
          } catch (err) {
            console.warn('Failed to fetch full object or linked spsOrderLine:', err);
            spsOrderLine = null;
          }
        }
        // Additional logs for debugging
        console.log('ELSE block triggered: creating new scheduled demand');
        console.log('selectedDate:', selectedDate);
        console.log('rowData:', rowData);
        console.log('scheduledDemandResult:', scheduledDemandResult);
        console.log('spsOrderLine:', spsOrderLine);
        // Fallback: use rowData or build minimal object if needed
        const addResult = await client(devAddSpsOrCommit).applyAction(
          {
            spsOrderLine: spsOrderLine?.value as Osdk.Instance<DevSpsOrderLine>,
            dueDate: selectedDate,
            carType: rowData.carType,
            orderSiteValue: rowData.site,
            partName: rowData.part,
            scenario: scenarioValue,
            source: rowData.source,
            totalQuantity: cellValue,
            endCustomer: rowData.endCustomer,
          },
          { $returnEdits: true }
        );
        console.log('devAddSpsOrCommit result:', addResult);
        if (addResult.type === "edits") {
          const updatedObject = addResult.editedObjectTypes[0];
          console.log("Created object", updatedObject);
        }
      }
    } catch (error) {
      console.error('Error in cell edit commit:', error);
    }
  }, [buildFilterQuery, pivotRows, dueDate, scenario, startDate]);

  // New processRowUpdate handler to trigger on cell edits for date columns
  const processRowUpdateHandler = useCallback(async (newRow: any, oldRow: any) => {
    // Determine which field has been changed that is not a base column
    const changedField = Object.keys(newRow).find(key => newRow[key] !== oldRow[key] && !BASE_COLUMN_ORDER.some(col => col.field === key));
    if(changedField) {
      const params = { id: newRow.id, field: changedField, row: newRow };
      await handleCellEditCommit(params);
    }
    return newRow;
  }, [handleCellEditCommit]);

  const fetchPivotTable = useCallback(async () => {
    setPivotLoading(true);
    try {
      const filteredOrderLines = buildFilterQuery();

      // Get filtered records as array
      const filteredOrderLinesArray: Osdk.Instance<SpsOrderLine>[] = [];
      for await (const obj of filteredOrderLines.asyncIter()) {
        filteredOrderLinesArray.push(obj);
      }

      updateFilterOptions(filteredOrderLinesArray);

      // Build types array based on order details checkboxes
      const types = Object.entries(orderDetails)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type);

      const pivotParams: PivotParams = {
        orderLines: filteredOrderLines,
        startDate,
        dueDate,
        selectedScenarioName: scenario,
        types: types.length > 0 ? types : ['sps', 'commit'],
        grouping: dateBucket
      };

      const result = await client(consolidatedFunctionBackedPivotTableSPS).executeFunction(pivotParams);
      console.log('Pivot function raw result:', result);
      
      // Extract rows from result
      let flatRows: Array<Record<string, unknown>> = [];
      if (Array.isArray(result)) {
        flatRows = result;
      } else if (result && typeof result === 'object') {
        if (Array.isArray((result as any).data)) {
          flatRows = (result as any).data;
        } else if (Array.isArray((result as any).rows)) {
          flatRows = (result as any).rows;
        }
      }

      const { rows: processedRows, dates } = processPivotData(flatRows);
      const columns = buildPivotColumns(dates);

      setPivotRows(processedRows);
      setPivotColumns(columns);
    } catch (error) {
      console.error('Error fetching pivot table:', error);
      setPivotRows([]);
      setPivotColumns([]);
    } finally {
      setPivotLoading(false);
    }
  }, [buildFilterQuery, updateFilterOptions, orderDetails, startDate, dueDate, scenario, dateBucket, processPivotData, buildPivotColumns]);

  // Memoized filter handlers
  const filterHandlers = useMemo(() => ({
    setPartName: (value: string[]) => setFilters(prev => ({ ...prev, partName: value })),
    setFileNumber: (value: string[]) => setFilters(prev => ({ ...prev, fileNumber: value })),
    setSpsPart: (value: string[]) => setFilters(prev => ({ ...prev, spsPart: value })),
    setSpsStatus: (value: string[]) => setFilters(prev => ({ ...prev, spsStatus: value })),
    setProductionLine: (value: string[]) => setFilters(prev => ({ ...prev, productionLine: value })),
  }), []);

  // Effects
  useEffect(() => {
    fetchPivotTable();
  }, [fetchPivotTable]);

  const handleRefresh = useCallback(() => {
    fetchPivotTable();
  }, [fetchPivotTable]);

  // Memoized DataGrid props
  const dataGridProps = useMemo(() => ({
    rows: pivotRows.slice(1), // Hide the first row
    columns: pivotColumns,
    loading: pivotLoading,
    pageSizeOptions: [10, 25, 50, 100] as const,
    initialState: {
      pagination: {
        paginationModel: { page: 0, pageSize: 25 },
      },
      columns: {
        columnVisibilityModel: {},
      },
    },
    getRowClassName: (params: any) =>
      params.indexRelativeToCurrentPage % 2 === 0 ? 'grey-row' : '',
    // Removed onCellEditCommit in favor of processRowUpdate
  }), [pivotRows, pivotColumns, pivotLoading]);

  return (
    <Layout>
      <Box sx={{ 
        width: '100vw', 
        height: '100vh', 
        boxSizing: 'border-box', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          SPS Scheduling Dashboard
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          height: 'calc(100vh - 80px)',
          overflow: 'hidden'
        }}>
          {/* Collapsible Filter Panel */}
          <Box sx={{ 
            width: filterPanelOpen ? 320 : 0, 
            transition: 'width 0.3s ease-in-out',
            overflow: 'hidden',
            height: '100%',
            flexShrink: 0
          }}>
            <CollapsibleFilterPanel
              open={filterPanelOpen}
              onToggle={setFilterPanelOpen}
              partName={filters.partName}
              setPartName={filterHandlers.setPartName}
              partNameOptions={filterOptions.partName}
              fileNumber={filters.fileNumber}
              setFileNumber={filterHandlers.setFileNumber}
              fileNumberOptions={filterOptions.fileNumber}
              spsPart={filters.spsPart}
              setSpsPart={filterHandlers.setSpsPart}
              spsPartOptions={filterOptions.spsPart}
              spsStatus={filters.spsStatus}
              setSpsStatus={filterHandlers.setSpsStatus}
              spsStatusOptions={filterOptions.spsStatus}
              orderSiteValue={orderSiteValue}
              setOrderSiteValue={setOrderSiteValue}
              productionLine={filters.productionLine}
              setProductionLine={filterHandlers.setProductionLine}
              productionLineOptions={filterOptions.productionLine}
            />
          </Box>
          {/* Main Content */}
          <Box sx={{ 
            flex: 1, 
            height: '100%', 
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column',
          }}>
            {/* Control Panel */}
            <Box sx={{ flexShrink: 0 }}>
              <ControlPanel
                scenario={scenario}
                setScenario={setScenario}
                startDate={startDate}
                setStartDate={setStartDate}
                dueDate={dueDate}
                setDueDate={setDueDate}
                orderDetails={orderDetails}
                setOrderDetails={setOrderDetails}
                dateBucket={dateBucket}
                setDateBucket={setDateBucket}
                onRefresh={handleRefresh}
              />
            </Box>
            {/* Pivot Table */}
            <Paper elevation={2} sx={{ 
              flex: 1, 
              width: '100%', 
              minWidth: 0, 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              margin: 0
            }}>
              <DataGrid
                {...dataGridProps}
                editMode="cell"
                isCellEditable={(params) => !BASE_COLUMN_ORDER.some(col => col.field === params.field)}
                processRowUpdate={processRowUpdateHandler}
                sx={{
                  border: 0,
                  width: '100%',
                  height: '100%',
                  '& .MuiDataGrid-cell:hover': {
                    color: 'primary.main',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'grey.50',
                    borderBottom: 2,
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-cell': {
                    borderColor: 'grey.200',
                  },
                  '& .MuiDataGrid-pinnedColumns': {
                    backgroundColor: 'grey.25',
                    borderRight: 2,
                    borderColor: 'primary.light',
                  },
                  '& .MuiDataGrid-pinnedColumnsContainer': {
                    backgroundColor: 'background.paper',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                  },
                  '& .MuiDataGrid-columnHeader--pinned': {
                    backgroundColor: 'grey.100',
                    fontWeight: 600,
                  },
                  '& .grey-row': {
                    backgroundColor: 'grey.100',
                  },
                  // Fix column menu positioning for all columns
                  '& .MuiDataGrid-columnHeader': {
                    '& .MuiDataGrid-menuIconButton': {
                      marginLeft: 'auto',
                      marginRight: '4px',
                    },
                  },
                  // Ensure date columns have consistent menu positioning
                  '& .custom-header': {
                    '& .MuiDataGrid-menuIconButton': {
                      marginLeft: 'auto',
                      marginRight: '4px',
                    },
                  },
                  // Override any type-specific styling
                  '& .MuiDataGrid-columnHeader--numeric': {
                    '& .MuiDataGrid-menuIconButton': {
                      marginLeft: 'auto',
                      marginRight: '4px',
                    },
                  },
                }}
                pagination
                autoHeight={false}
                hideFooterSelectedRowCount
              />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

export default Home;