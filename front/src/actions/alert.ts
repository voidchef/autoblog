import { Dispatch } from 'redux';
import { v4 as uuid } from 'uuid';
import { SET_ALERT, REMOVE_ALERT, ALERT_CLEAR_TIME, Action, ALERT_TYPE } from '../utils/consts';

export const setAlert = (msg: string, alertType: ALERT_TYPE) => (dispatch: Dispatch<Action>) => {
  const alertId = uuid();
  dispatch({
    type: SET_ALERT,
    payload: { alertId, alertType, msg },
  });

  setTimeout(
    () =>
      dispatch({
        type: REMOVE_ALERT,
        payload: alertId,
      }),
    ALERT_CLEAR_TIME,
  );
};
