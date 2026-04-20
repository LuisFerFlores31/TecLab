import { NavLink } from 'react-router-dom';
import { Home, Package, PlusCircle, BarChart2, AlertTriangle, Settings, LogOut, Users } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand" aria-label="Logo placeholder">
          <h2>Lab Inventory</h2>
          <p>Tec de Monterrey</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Package size={20} />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <PlusCircle size={20} />
          <span>Add New</span>
        </NavLink>
        {user?.role === 'Director' && (
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Users size={20} />
            <span>Add User</span>
          </NavLink>
        )}
        <div className="nav-item disabled">
          <BarChart2 size={20} />
          <span>Analytics</span>
        </div>
        <div className="nav-item disabled">
          <AlertTriangle size={20} />
          <span>Alerts</span>
        </div>
        <div className="nav-item disabled">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        <p className="copyright">© 2026 Los Makuins</p>
      </div>
    </aside>
  );
}
