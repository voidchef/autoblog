import Box from '@mui/material/Box';
import { AlertPayload } from '../../../reducers/alert';
import { RootState } from '../../../store';
import { REMOVE_ALERT } from '../../../utils/consts';
import Alert from '@mui/material/Alert';
import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AlertTitle from '@mui/material/AlertTitle';

const Alerts = () => {
  const alerts = useSelector<RootState, AlertPayload[]>((state) => state.alert);
  const dispatch = useDispatch();

  return (
    <Box width="50%" right={0} position="fixed" zIndex={10000} display={'none'} justifyContent={'flex-end'} padding={'2rem'}>
      <Fragment>
        {alerts &&
          alerts.length > 0 &&
          alerts.map((alert) => (
            <Alert
              className="fade error-alert slide-in-top"
              onClose={() =>
                dispatch({
                  type: REMOVE_ALERT,
                  payload: alert.alertId,
                })
              }
              severity={alert.alertType ?? 'info'}
              key={alert.alertId}
            >
              <AlertTitle>{alert.alertType}</AlertTitle>
              {alert.msg}
            </Alert>
          ))}
      </Fragment>
    </Box>
  );
};

export default Alerts;
