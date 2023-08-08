import { Dispatch } from 'react';
import { SET_LOADING, Action } from '../utils/consts';

export const setLoading =
  ({ loading }: { loading: boolean }) =>
  async (dispatch: Dispatch<Action>) => {
    try {
      dispatch({
        type: SET_LOADING,
        payload: loading,
      });
    } catch (err: any) {
      console.log(err);
    }
  };
