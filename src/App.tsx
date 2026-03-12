import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import UserHeader from './components/UserHeader';
import UserFooter from './components/UserFooter';
import ChatBot from './components/ChatBot';
import LuckyWheelBox from './components/LuckyWheelBox';
import './App.css';

export default function App(): React.ReactElement {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isUserRoute = !isAdminRoute;

  return (
    <div className="App">
      {isAdminRoute ? <Navigation /> : <UserHeader />}
      <main style={isUserRoute ? { paddingTop: '80px' } : {}}>
        <Outlet />
      </main>
      {isUserRoute && <UserFooter />}
      {isUserRoute && <ChatBot />}
      {isUserRoute && <LuckyWheelBox />}
    </div>
  );
}

