import { useEffect, useState } from "react";
//import { SpsOrderLine } from "@sps-scheduling-external/sdk";
import { SpsOrderLine , consolidatedFunctionBackedPivotTableSPS } from "@dev-sps-scheduling/sdk";
import client from "./client";
import Layout from "./Layout";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Paper } from '@mui/material';

function Home() {
  // State for pivot table only
  const [pivotRows, setPivotRows] = useState<any[]>([]);
  const [pivotLoading, setPivotLoading] = useState(false);
  const [pivotColumns, setPivotColumns] = useState<GridColDef[]>([]);

  useEffect(() => {
    async function fetchPivotTable() {
      setPivotLoading(true);
      try {
        // Build the filtered SpsOrderLine object set
        const filteredOrderLines = client(SpsOrderLine).where({
          $and: [
            { spsPart: { $eq: "Y" } },
            { spsStatus: { $in: ["AO", "Firm", "Pending", "Available", "Reserved"] } }
          ]
        });

        const pivotParams = {
          orderLines: filteredOrderLines,
          startDate: "2025-07-14",
          dueDate: "2026-07-14",
          selectedScenarioName: "",
          types: ['sps', 'commit']
          // types and grouping are optional
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

        // Pivot transformation
        // 1. Get all unique dates
        const allDates = Array.from(new Set(flatRows.map((r) => r.date as string))).sort();

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
          // Set the quantity for this date
          const date = row.date as string;
          const quantity = (row.values && typeof row.values === 'object' && 'quantity' in row.values) ? (row.values as { quantity?: number }).quantity : null;
          rowMap.get(key)![date] = quantity ?? null;
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
            minWidth: 120,
            flex: 1,
            sortable: true,
          })),
          ...allDates.map(date => ({
            field: date,
            headerName: date,
            minWidth: 120,
            flex: 1,
            sortable: true,
            type: 'number',
          }))
        ];

        setPivotRows(pivotRows);
        setPivotColumns(pivotColumns);
      } catch {
        setPivotRows([]);
        setPivotColumns([]);
      } finally {
        setPivotLoading(false);
      }
    }
    fetchPivotTable();
  }, []);

  return (
    <Layout>
      <Box sx={{ padding: 3 }}>
        {/* Pivot Table Section */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Pivot Table Output
          </Typography>
          <Paper elevation={2} sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={pivotRows}
              columns={pivotColumns}
              loading={pivotLoading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              sx={{
                border: 0,
                '& .MuiDataGrid-cell:hover': {
                  color: 'primary.main',
                },
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}

export default Home;