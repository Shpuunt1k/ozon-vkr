import React, {FC, useContext, useEffect, useState} from 'react';
//import General from "./components/General";
import {Context} from "./index";
import { BrowserRouter } from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {IUser} from "./models/IUser";
import UserService from "./services/UserService";
import { Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/home';
import StocksPage from "./pages/stocks"
import SupplyPage from "./pages/supply"
import CalcPage from './pages/calc';
import AIPage from './pages/AI'
import MarginPage from './pages/margin'

const App: FC = () => {
   return (
      <BrowserRouter>
      <Routes>
         <Route path='/' element={<HomePage/>}/>
         <Route path='/stocks' element={<StocksPage/>}/>
         <Route path='/supply' element={<SupplyPage/>}/>
         <Route path='/supply/:id' element={<CalcPage/>}/>
         <Route path='/supply/AI/:id' element={<AIPage/>}/>
         <Route path='/supply/margin/:id' element={<MarginPage/>}/>
      </Routes>
      </BrowserRouter>
   )
};

export default observer(App);
