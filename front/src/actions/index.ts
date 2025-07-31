import { createAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { ALERT_TYPE, ALERT_CLEAR_TIME } from '../utils/consts';
import { setAlert as setAlertAction, removeAlert } from '../reducers/alert';
import { addNotification } from '../reducers/ui';
import type { AppDispatch } from '../store';

// Enhanced alert actions with automatic cleanup
export const setAlert =
  (msg: string, alertType: ALERT_TYPE, duration: number = ALERT_CLEAR_TIME) =>
  (dispatch: AppDispatch) => {
    const alertId = uuid();

    // Add to both legacy alert system and new notification system
    dispatch(
      setAlertAction({
        alertId,
        alertType,
        msg,
      }),
    );

    dispatch(
      addNotification({
        type: alertType === ALERT_TYPE.SUCCESS ? 'success' : alertType === ALERT_TYPE.DANGER ? 'error' : 'info',
        message: msg,
        autoHide: true,
        duration,
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

// Enhanced error handling action
export const handleApiError = createAction<{
  error: any;
  defaultMessage?: string;
  showNotification?: boolean;
}>('api/handleError');

// Global error handler middleware action
export const globalErrorHandler =
  (error: any, defaultMessage = 'An error occurred') =>
  (dispatch: AppDispatch) => {
    let message = defaultMessage;

    if (error?.data?.message) {
      message = error.data.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    dispatch(showError(message));

    // Log error for debugging
    console.error('Global error:', error);
  };

// Action for handling loading states
export const setLoadingState = createAction<{
  key: string;
  isLoading: boolean;
}>('ui/setLoadingState');
