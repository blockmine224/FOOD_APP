import React, { createContext, useContext, useState } from "react";
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [confirm, setConfirm] = useState({ open: false, title: "", message: "", onConfirm: null });

  const notify = (message, severity = "info") => setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  const confirmDialog = (title, message, onYes) => setConfirm({ open: true, title, message, onConfirm: () => { onYes(); setConfirm(c => ({ ...c, open: false })); } });
  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  return (
    <NotificationContext.Provider value={{ notify, confirmDialog }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
      <Dialog open={confirm.open} onClose={closeConfirm}>
        <DialogTitle>{confirm.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirm.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} color="primary">Hủy</Button>
          <Button onClick={confirm.onConfirm} color="error" variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </NotificationContext.Provider>
  );
}