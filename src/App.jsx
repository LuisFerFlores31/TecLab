import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddAsset from './pages/AddAsset';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout onLogout={() => setUser(null)} />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="add" element={<AddAsset />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
