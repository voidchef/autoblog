import { createAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { ALERT_TYPE, ALERT_CLEAR_TIME } from '../utils/consts';
import { setAlert as setAlertAction, removeAlert } from '../reducers/alert';
import type { AppDispatch } from '../store';

// Enhanced alert actions with automatic cleanup
export const setAlert =
  (msg: string, alertType: ALERT_TYPE, duration: number = ALERT_CLEAR_TIME) =>
  (dispatch: AppDispatch) => {
    const alertId = uuid();

    dispatch(
      setAlertAction({
        alertId,
        alertType,
        msg,
      }),
    );

    setTimeout(() => {
      dispatch(removeAlert(alertId));
    }, duration);
  };

// Action creators for common UI patterns
export const showSuccess = (message: string) => setAlert(message, ALERT_TYPE.SUCCESS);
export const showError = (message: string) => setAlert(message, ALERT_TYPE.DANGER);
export const showInfo = (message: string) => setAlert(message, ALERT_TYPE.INFO);