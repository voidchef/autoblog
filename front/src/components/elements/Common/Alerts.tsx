import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { Fragment } from 'react';
import { useDispatch } from 'react-redux';
import AlertTitle from '@mui/material/AlertTitle';
import Slide from '@mui/material/Slide';
import { useAppSelector } from '../../../utils/reduxHooks';
import { removeAlert } from '../../../reducers/alert';

const Alerts = () => {
  const alerts = useAppSelector((state) => state.alert);
  const dispatch = useDispatch();

  return (
    <Box
      width={{ xs: '80%', sm: '50%' }}
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
                  onClose={() => dispatch(removeAlert(alert.alertId))}
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
