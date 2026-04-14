import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ onLogout }) {
  return (
    <div className="layout-container">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
