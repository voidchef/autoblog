import { SET_ALERT, REMOVE_ALERT, Action, ALERT_TYPE } from '../utils/consts';

export interface AlertPayload {
  alertId?: string;
  alertType?: ALERT_TYPE;
  msg?: string;
}

const initialState: AlertPayload[] = [];

const alertReducer = (state = initialState, action: Action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter((alert) => alert.alertId !== payload);
    default:
      return state;
  }
};

export default alertReducer;
