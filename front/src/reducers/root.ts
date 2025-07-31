import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RootState {
  loading: boolean;
}

const initialState: RootState = {
  loading: false,
};

const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoading } = rootSlice.actions;
export default rootSlice.reducer;
