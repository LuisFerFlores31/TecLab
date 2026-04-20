import { useState } from 'react';
import { UserPlus, Save } from 'lucide-react';
import { getUsers, addUser } from '../data/usersData';
import { Navigate } from 'react-router-dom';
import './AddUser.css';

export default function AddUser({ user }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState('');

  // Proteger la ruta: Si no es Director, redirigir al Dashboard
  if (!user || user.role !== 'Director') {
    return <Navigate to="/" />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');

    // Verificar si el email ya existe
    const currentUsers = getUsers();
    const exists = currentUsers.find(u => u.email === email);
    if (exists) {
      alert('Ese correo institucional ya está registrado.');
      return;
    }

    const newUser = {
      id: currentUsers.length + 1,
      name,
      email,
      password,
      role
    };

    // Agregar el usuario (lo guarda en memoria local)
    addUser(newUser);

    setSuccess(`¡Usuario ${name} (${role}) agregado exitosamente!`);

    // Limpiar formulario
    setName('');
    setEmail('');
    setPassword('');
    setRole('');
  };

  return (
    <div className="add-user">
      <div className="page-header">
        <h1>Add New Staff User</h1>
        <p>Register new coordinators, lab assistants, or directors</p>
      </div>

      <div className="card add-user-card">
        <div className="add-user-header">
          <UserPlus size={40} className="add-user-icon" />
          <h2 className="card-title">User Details</h2>
        </div>

        {success && <div className="success-msg">{success}</div>}

        <form className="asset-form user-form" onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              placeholder="e.g., Ana Torres"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-split">
            <div className="form-group">
              <label>Institutional Email <span className="required">*</span></label>
              <input
                type="email"
                placeholder="usuario@tec.mx"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Role <span className="required">*</span></label>
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="" disabled>Select role</option>
                <option value="Laboratorista">Laboratorista</option>
                <option value="Coordinador">Coordinador</option>
                <option value="Director">Director</option>
              </select>
            </div>
          </div>

          <div className="form-group half-width" style={{ width: '100%' }}>
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <small className="hint">The user must use this password to log in.</small>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2">
              <Save size={18} />
              Register User
            </button>
            <button type="button" className="btn-secondary" onClick={() => {
              setName(''); setEmail(''); setPassword(''); setRole(''); setSuccess('');
            }}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
