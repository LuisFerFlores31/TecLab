import { NavLink } from 'react-router-dom'
import { Home, Package, PlusCircle, BarChart2, AlertTriangle, Settings, LogOut, Users, Beaker } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <h2>Lab Inventory</h2>
          <p>Tec de Monterrey</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
          <Home size={20} /><span>Dashboard</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Package size={20} /><span>Inventario</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <PlusCircle size={20} /><span>Agregar Nuevo</span>
        </NavLink>

        {user?.role === 'coordinador' && (
          <>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /><span>Usuarios</span>
            </NavLink>
            <NavLink to="/labs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Beaker size={20} /><span>Laboratorios</span>
            </NavLink>
          </>
        )}

        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={20} /><span>Historial</span>
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <AlertTriangle size={20} /><span>Alertas</span>
        </NavLink>
        <div className="nav-item disabled">
          <Settings size={20} /><span>Configuración</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} /><span>Logout</span>
        </button>
        <p className="copyright">© 2026 Los Makuins</p>
      </div>
    </aside>
  )
}