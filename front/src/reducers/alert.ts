import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ALERT_TYPE } from '../utils/consts';

export interface AlertPayload {
  alertId: string;
  alertType: ALERT_TYPE;
  msg: string;
}

const initialState: AlertPayload[] = [];

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (state, action: PayloadAction<AlertPayload>) => {
      state.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      return state.filter((alert) => alert.alertId !== action.payload);
    },
  },
});

export const { setAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;
