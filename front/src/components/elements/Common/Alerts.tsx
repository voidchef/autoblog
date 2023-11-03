import Box from '@mui/material/Box';
import { AlertPayload } from '../../../reducers/alert';
import { RootState } from '../../../store';
import { REMOVE_ALERT } from '../../../utils/consts';
import Alert from '@mui/material/Alert';
import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AlertTitle from '@mui/material/AlertTitle';
import Slide from '@mui/material/Slide';

const Alerts = () => {
  const alerts = useSelector<RootState, AlertPayload[]>((state) => state.alert);
  const dispatch = useDispatch();

  return (
    <Box
      width="50%"
      right={0}
      position="fixed"
      zIndex={10000}
      display={alerts.length > 0 ? 'flex' : 'none'}
      flexDirection={'column'}
      justifyContent={'flex-end'}
      padding={'2rem'}
    >
      <Fragment>
        {alerts &&
          alerts.length > 0 &&
          alerts.map((alert) => (
            <div key={alert.alertId}>
              <Slide direction="up" in={true} timeout={500}>
                <Alert
                  className="spaced-alert"
                  onClose={() =>
                    dispatch({
                      type: REMOVE_ALERT,
                      payload: alert.alertId,
                    })
                  }
                  severity={alert.alertType ?? 'info'}
                  key={alert.alertId}
                  sx={{ marginBottom: '10px' }}
                >
                  <AlertTitle>{alert.alertType}</AlertTitle>
                  {alert.msg}
                </Alert>
              </Slide>
            </div>
          ))}
      </Fragment>
    </Box>
  );
};

export default Alerts;
