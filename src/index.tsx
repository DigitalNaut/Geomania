import React from 'react';
import ReactDOM from 'react-dom';

import MapContextProvider from 'src/controllers/MapContext';

import App from './App';
import reportWebVitals from './reportWebVitals';

import 'leaflet/dist/leaflet.css';
import 'src/index.css';

ReactDOM.render(
  <React.StrictMode>
    <MapContextProvider>
      <App />
    </MapContextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
