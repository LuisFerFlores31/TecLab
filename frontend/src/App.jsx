import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddAsset from './pages/AddAsset';
import Login from './pages/Login';
import AddUser from './pages/AddUser';
import Alerts from './pages/Alerts';
import ManageLabs from './pages/ManageLabs';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={() => setUser(null)} />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="add" element={<AddAsset />} />
          <Route path="edit/:id" element={<AddAsset />} />
          <Route path="users" element={<AddUser user={user} />} />
          <Route path="labs" element={<ManageLabs user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
