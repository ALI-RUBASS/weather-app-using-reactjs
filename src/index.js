import React from "react";
import ReactDOM from "react-dom";
import './tailwind.css'
import './index.css'
import App from './App.jsx'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
   
      <App />

  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();