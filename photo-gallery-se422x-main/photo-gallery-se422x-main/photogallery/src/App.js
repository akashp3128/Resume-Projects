import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './screens/LoginPage';
import HomePage from './screens/HomePage';
import SignupPage from './screens/SignupPage';

const ENDPOINT = process.env.REACT_APP_BUCKET_ENV === "prod" ? "http://3.134.102.41":"http://127.0.0.1:8080"

export default function App() {
  return (
    <div className='min-vh-100' style={{backgroundColor:"#3B3B3B"}}>
      <BrowserRouter>
          <Routes>
            <Route exact path ='/ui' element={<LoginPage ENDPOINT={ENDPOINT}/>} />
            <Route path ='/ui/login' element={<LoginPage ENDPOINT={ENDPOINT}/>} />
            <Route path ='/ui/signup' element={<SignupPage ENDPOINT={ENDPOINT}/>} />
            <Route path ='/ui/home' element={<HomePage ENDPOINT={ENDPOINT}/>} />
          </Routes>
      </BrowserRouter>
    </div>
  )
}
