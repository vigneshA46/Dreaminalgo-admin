import { useState } from 'react'
import '@mantine/core/styles.css';

import { MantineProvider, Text } from '@mantine/core';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Strategies from './components/Strategies';
import Subscriptions from './components/Subscriptions';
import Broker from './components/Broker';
import Tradingactivity from './components/Tradingactivity';
import Reports from './components/Reports';
import Education from './components/Education';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import Home from './modules/Home';
import Createstratergy from './components/Createstratergy';
import Tradingsignal from './components/Tradingsignal';
import Planspricing from './components/Planspricing';
import Tutorials from './components/Tutorials';
import Login from './components/Login';
import Createtradersignal from './components/Createtradersignal';
import Coupons from './components/coupons';
import StockSelection from './components/StockSelect';
import Emergency_exit from './components/Emergency_exit';
import EmergencyTradeExit from './components/EmergencyTradeExit';
import Tokenlogs from './components/Tokenlogs';
import { ModalsProvider } from "@mantine/modals";
import Expenseincome from './components/Expenseincome';


function App() {

  return (
    <MantineProvider>
          <ModalsProvider>

      <Router>
        <Routes>

          <Route
            path="/auth/login"
            element={
                <Login />
            }
          />
          <Route path='/' element={<Home/>}>


          <Route index element={<Dashboard/>} />
          <Route path='users' element={<Users/>} />
          <Route path='stratergies' element={<Strategies/>} />
          <Route path='subscriptions' element={<Subscriptions/>} />
          <Route path='broker' element={<Broker/>} />
          <Route path='trading-activity' element={<Tradingactivity/>} />
          <Route path='reports' element={<Reports/>} />
          <Route path='education' element={<Education/>} />
          <Route path='notifications' element={<Notifications/>} />
          <Route path='settings' element={<Settings/>} />
          <Route path='create-stratergy' element={<Createstratergy/>} />
          <Route path='create-signal' element={<Tradingsignal/>} />
          <Route path='trading-signal' element={<Createtradersignal/>} />
          <Route path='plans-pricing' element={<Planspricing/>} />
          <Route path='tutorials' element={<Tutorials/>} />
          <Route path='coupons' element={<Coupons/>} />
          <Route path='select-coupons' element={<StockSelection/>} />
          <Route path='emergency' element={<Emergency_exit/>} />
          <Route path='emergency-trade-exit' element={<EmergencyTradeExit/>} />
          <Route path='token-logs' element={<Tokenlogs/>} />
          <Route path='expense-income' element={<Expenseincome/>} />

          
          
          </Route>
        </Routes>
      </Router>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default App
