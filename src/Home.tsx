import { useEffect, useState } from "react";
import { SpsOrderLine, consolidatedFunctionBackedPivotTableSPS } from "@dev-sps-scheduling/sdk";
import client from "./client";
import Layout from "./Layout";
import FilterPanel from "./components/FilterPanel";
import ControlPanel from "./components/ControlPanel";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';
import dayjs from 'dayjs';

function Home() {
  // Filter states
  const [partName, setPartName] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [spsStatus, setSpsStatus] = useState<string[]>(['AO', 'Firm', 'Pending', 'Available', 'Reserved']);
  const [orderSiteValue, setOrderSiteValue] = useState('');
  const [productionLine, setProductionLine] = useState('');

  // Control states
  const [scenario, setScenario] = useState('');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'));
  const [orderDetails, setOrderDetails] = useState({
    sps: true,
    commit: true,
    pr: false,
  });
  const [dateBucket, setDateBucket] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Pivot table states
  const [pivotRows, setPivotRows] = useState<any[]>([]);
  const [pivotLoading, setPivotLoading] = useState(false);
  const [pivotColumns, setPivotColumns] = useState<GridColDef[]>([]);

  // Helper function to format dates based on bucket type
  const formatDateByBucket = (dateStr: string, bucket: 'daily' | 'weekly' | 'monthly'): string => {
    const date = dayjs(dateStr);
    switch (bucket) {
      case 'weekly':
        // Format as "Week of YYYY-MM-DD" (Monday of that week)
        const startOfWeek = date.startOf('week');
        return `Week of ${startOfWeek.format('YYYY-MM-DD')}`;
      case 'monthly':
        // Format as "YYYY-MM"
        return date.format('YYYY-MM');
      case 'daily':
      default:
        return dateStr;
    }
  };

  // Helper function to group dates by bucket
  const groupDatesByBucket = (dates: string[], bucket: 'daily' | 'weekly' | 'monthly'): string[] => {
    const groupedDates = new Set<string>();
    dates.forEach(dateStr => {
      groupedDates.add(formatDateByBucket(dateStr, bucket));
    });
    return Array.from(groupedDates).sort();
  };

  const fetchPivotTable = async () => {
    setPivotLoading(true);
    try {
      // Build the filtered SpsOrderLine object set with applied filters
      let filteredOrderLines = client(SpsOrderLine).where({
        $and: [
          { spsPart: { $eq: "Y" } },
          { spsStatus: { $in: spsStatus.length > 0 ? spsStatus : ["AO", "Firm", "Pending", "Available", "Reserved"] } }
        ]
      });

      // Apply additional filters if they have values
      const additionalFilters: any[] = [];
      
      if (partName.trim()) {
        additionalFilters.push({ part: { $contains: partName.trim() } });
      }
      
      if (fileNumber.trim()) {
        additionalFilters.push({ fileNumber: { $contains: fileNumber.trim() } });
      }
      
      if (orderSiteValue.trim()) {
        additionalFilters.push({ orderSiteValue: { $contains: orderSiteValue.trim() } });
      }
      
      if (productionLine.trim()) {
        additionalFilters.push({ productionLine: { $contains: productionLine.trim() } });
      }

      if (additionalFilters.length > 0) {
        filteredOrderLines = filteredOrderLines.where({ $and: additionalFilters });
      }

      // Build types array based on order details checkboxes
      const types: string[] = [];
      if (orderDetails.sps) types.push('sps');
      if (orderDetails.commit) types.push('commit');
      if (orderDetails.pr) types.push('pr');

      const pivotParams = {
        orderLines: filteredOrderLines,
        startDate: startDate,
        dueDate: dueDate,
        selectedScenarioName: scenario,
        types: types.length > 0 ? types : ['sps', 'commit']
      };

      const result = await client(consolidatedFunctionBackedPivotTableSPS).executeFunction(pivotParams);
      console.log('Pivot function raw result:', result);
      
      // Try to extract rows from result
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

      // Pivot transformation with date bucketing
      // 1. Get all unique dates and group them by bucket type
      const allOriginalDates = Array.from(new Set(flatRows.map((r) => r.date as string))).sort();
      const allDates = groupDatesByBucket(allOriginalDates, dateBucket);

      // 2. Define the desired column order and labels
      const baseColumnOrder = [
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
      ];

      // 3. Group by all fields except date and values.quantity
      function getRowKey(row: Record<string, unknown>) {
        const { date, values, ...rest } = row;
        // Only keep fields in baseColumnOrder
        const filteredRest: Record<string, unknown> = {};
        baseColumnOrder.forEach(col => {
          filteredRest[col.field] = rest[col.field];
        });
        return JSON.stringify(filteredRest);
      }

      const rowMap = new Map<string, Record<string, unknown>>();
      flatRows.forEach((row) => {
        const key = getRowKey(row);
        if (!rowMap.has(key)) {
          rowMap.set(key, { ...JSON.parse(key), id: rowMap.size + 1 });
        }
        // Set the quantity for this date (grouped by bucket)
        const originalDate = row.date as string;
        const groupedDate = formatDateByBucket(originalDate, dateBucket);
        const quantity = (row.values && typeof row.values === 'object' && 'quantity' in row.values) ? (row.values as { quantity?: number }).quantity : null;
        
        // If we're grouping by week/month, we need to sum quantities for the same grouped date
        const existingQuantity = rowMap.get(key)![groupedDate] as number || 0;
        rowMap.get(key)![groupedDate] = (existingQuantity + (quantity ?? 0));
      });
      
      const pivotRows = Array.from(rowMap.values());
      
      // Sort by Site asc, Part asc, Source desc
      pivotRows.sort((a, b) => {
        // Site asc
        const siteA = String(a.site ?? "");
        const siteB = String(b.site ?? "");
        if (siteA < siteB) return -1;
        if (siteA > siteB) return 1;
        // Part asc
        const partA = String(a.part ?? "");
        const partB = String(b.part ?? "");
        if (partA < partB) return -1;
        if (partA > partB) return 1;
        // Source desc
        const sourceA = String(a.source ?? "");
        const sourceB = String(b.source ?? "");
        if (sourceA < sourceB) return 1;
        if (sourceA > sourceB) return -1;
        return 0;
      });

      // 4. Build columns: base columns + one column per date (header is date, value is quantity)
      const pivotColumns: GridColDef[] = [
        ...baseColumnOrder.map(col => ({
          field: col.field,
          headerName: col.headerName,
          width: 120,
          sortable: true,
          pinned: 'left' as const,
        })),
        ...allDates.map(date => ({
          field: date,
          headerName: date,
          width: 100,
          sortable: true,
          type: 'number' as const,
        }))
      ];

      setPivotRows(pivotRows);
      setPivotColumns(pivotColumns);
    } catch (error) {
      console.error('Error fetching pivot table:', error);
      setPivotRows([]);
      setPivotColumns([]);
    } finally {
      setPivotLoading(false);
    }
  };

  useEffect(() => {
    fetchPivotTable();
  }, [partName, fileNumber, spsStatus, orderSiteValue, productionLine, scenario, startDate, dueDate, orderDetails, dateBucket]);

  const handleRefresh = () => {
    fetchPivotTable();
  };

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          SPS Scheduling Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Filter Panel */}
          <FilterPanel
            partName={partName}
            setPartName={setPartName}
            fileNumber={fileNumber}
            setFileNumber={setFileNumber}
            spsStatus={spsStatus}
            setSpsStatus={setSpsStatus}
            orderSiteValue={orderSiteValue}
            setOrderSiteValue={setOrderSiteValue}
            productionLine={productionLine}
            dateBucket={dateBucket}
            setDateBucket={setDateBucket}
            setProductionLine={setProductionLine}
          />

          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Control Panel */}
            <ControlPanel
              scenario={scenario}
              setScenario={setScenario}
              startDate={startDate}
              setStartDate={setStartDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              orderDetails={orderDetails}
              setOrderDetails={setOrderDetails}
              onRefresh={handleRefresh}
            />

            {/* Pivot Table */}
            <Paper elevation={2} sx={{ height: 600, width: 1200, overflowX: 'auto' }}>
              <DataGrid
                rows={pivotRows}
                columns={pivotColumns}
                loading={pivotLoading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                  columns: {
                    columnVisibilityModel: {},
                  },
                }}
                sx={{
                  border: 0,
                  minWidth: 1200,
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
                }}
              />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
}

export default Home;