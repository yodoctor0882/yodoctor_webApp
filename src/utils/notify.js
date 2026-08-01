let showSnackbar;

export const setSnackbar = (fn) => {
  showSnackbar = fn;
};

export const notify = {
  success: (msg) => showSnackbar(msg, "success"),
  error: (msg) => showSnackbar(msg, "error"),
  warning: (msg) => showSnackbar(msg, "warning"),
  info: (msg) => showSnackbar(msg, "info"),
};