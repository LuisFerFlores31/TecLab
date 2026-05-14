import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout     from './components/Layout'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import Inventory  from './pages/Inventory'
import AddAsset   from './pages/AddAsset'
import AddUser    from './pages/AddUser'
import Alerts     from './pages/Alerts'
import ManageLabs from './pages/ManageLabs'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function CoordinatorRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'coordinador') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index                element={<Dashboard />} />
          <Route path="inventory"     element={<Inventory />} />
          <Route path="alerts"        element={<Alerts />} />
          <Route path="add"           element={<AddAsset />} />
          <Route path="edit/:id"      element={<AddAsset />} />
          <Route path="users"         element={<CoordinatorRoute><AddUser /></CoordinatorRoute>} />
          <Route path="labs"          element={<CoordinatorRoute><ManageLabs /></CoordinatorRoute>} />
        </Route>
      </Routes>
    </Router>
  )
}