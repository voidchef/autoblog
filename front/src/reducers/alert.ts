import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { ALERT_TYPE, ALERT_CLEAR_TIME } from '../utils/consts';

export interface AlertPayload {
  alertId: string;
  alertType: ALERT_TYPE;
  msg: string;
}

export interface ShowAlertPayload {
  msg: string;
  alertType: ALERT_TYPE;
  duration?: number;
}

const initialState: AlertPayload[] = [];

// Async thunk for showing alerts with auto-cleanup
export const showAlert = createAsyncThunk(
  'alert/showAlert',
  async (payload: ShowAlertPayload, { dispatch }) => {
    const alertId = uuid();
    const duration = payload.duration ?? ALERT_CLEAR_TIME;

    // Dispatch the alert
    dispatch(addAlert({
      alertId,
      alertType: payload.alertType,
      msg: payload.msg,
    }));

    // Auto-remove after duration
    setTimeout(() => {
      dispatch(removeAlert(alertId));
    }, duration);

    return alertId;
  }
);

// Helper action creators for common patterns
export const showSuccess = (message: string, duration?: number) => 
  showAlert({ msg: message, alertType: ALERT_TYPE.SUCCESS, duration });

export const showError = (message: string, duration?: number) => 
  showAlert({ msg: message, alertType: ALERT_TYPE.DANGER, duration });

export const showInfo = (message: string, duration?: number) => 
  showAlert({ msg: message, alertType: ALERT_TYPE.INFO, duration });

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<AlertPayload>) => {
      state.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      return state.filter((alert) => alert.alertId !== action.payload);
    },
    clearAllAlerts: (state) => {
      return [];
    },
  },
});

export const { addAlert, removeAlert, clearAllAlerts } = alertSlice.actions;
export default alertSlice.reducer;
