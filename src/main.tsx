//import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OsdkProvider } from "@osdk/react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "./index.css";
import client from "./client";
import { router } from "./router";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <OsdkProvider client={client}>
        <RouterProvider router={router} />
      </OsdkProvider>
    </ThemeProvider>
  // </StrictMode>
);