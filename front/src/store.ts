import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './services/api';
import rootReducer from './reducers/root';
import alertReducer from './reducers/alert';
import authReducer from './reducers/auth';
import userReducer from './reducers/user';
import blogReducer from './reducers/blog';
import appSettingsReducer from './reducers/appSettings';

// Configure store with modern RTK approach
const store = configureStore({
  reducer: {
    root: rootReducer,
    alert: alertReducer,
    auth: authReducer,
    user: userReducer,
    blog: blogReducer,
    appSettings: appSettingsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in state for serialization check
        ignoredPaths: ['api'],
      },
      // Enable additional checks in development
      immutableCheck: import.meta.env.MODE !== 'production',
      actionCreatorCheck: import.meta.env.MODE !== 'production',
    }).concat(api.middleware),
  devTools:
    import.meta.env.MODE !== 'production'
      ? {
          name: 'AutoBlog Redux Store',
          trace: true,
          traceLimit: 25,
          // Additional features for better debugging
          features: {
            pause: true, // start/pause recording of dispatched actions
            lock: true, // lock/unlock dispatching actions and side effects
            persist: true, // persist states on page reloading
            export: true, // export history of actions in a file
            import: 'custom', // import history of actions from a file
            jump: true, // jump back and forth (time travelling)
            skip: true, // skip (cancel) actions
            reorder: true, // drag and drop actions in the history list
            dispatch: true, // dispatch custom actions or action creators
            test: true, // generate tests for the selected actions
          },
        }
      : false,
  // Enhanced error handling
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({
      autoBatch: { type: 'tick' }, // Batch actions automatically
    }),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
