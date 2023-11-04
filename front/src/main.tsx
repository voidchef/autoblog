import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import Provider from 'react-redux/es/components/Provider';
import store from './store';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
