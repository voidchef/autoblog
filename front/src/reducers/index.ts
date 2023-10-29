import root from './root';
import alert from './alert';
import auth from './auth';
import user from './user';
import blog from './blog';
import appSettings from './appSettings';
import { combineReducers } from 'redux';

export default combineReducers({
  root,
  alert,
  auth,
  user,
  blog,
  appSettings,
});
