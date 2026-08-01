import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { setSnackbar } from "../../utils/notify";

const GlobalSnackbar = () => {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setSnackbar((message, severity) => {
      setState({
        open: true,
        message,
        severity,
      });
    });
  }, []);

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={3000}
      onClose={() => setState({ ...state, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity={state.severity}
        variant="filled"
        onClose={() => setState({ ...state, open: false })}
      >
        {state.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;