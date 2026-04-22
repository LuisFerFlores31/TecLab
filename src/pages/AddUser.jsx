import { useState, useEffect } from 'react';
import { UserPlus, Save, Edit, Trash2 } from 'lucide-react';
import { getUsers, addUser, updateUser, deleteUser } from '../../server/data/usersData';
import { Navigate } from 'react-router-dom';
import './AddUser.css';

export default function AddUser({ user }) {
  const [usersList, setUsersList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [success, setSuccess] = useState('');

  // Proteger la ruta: Si no es Coordinador, redirigir al Dashboard
  if (!user || user.role !== 'Coordinador') {
    return <Navigate to="/" />;
  }

  const loadUsers = () => {
    setUsersList(getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');

    if (editingId) {
      // Modo Edición
      const currentUsers = getUsers();
      const existing = currentUsers.find(u => u.email === email && u.id !== editingId);
      if (existing) {
        alert('Ese correo institucional ya está registrado por otro usuario.');
        return;
      }
      
      updateUser(editingId, { name, email, password, role });
      setSuccess(`¡Usuario ${name} actualizado exitosamente!`);
    } else {
      // Modo Creación
      const currentUsers = getUsers();
      const exists = currentUsers.find(u => u.email === email);
      if (exists) {
        alert('Ese correo institucional ya está registrado.');
        return;
      }

      const newUser = {
        id: Date.now(), // ID dinámico
        name,
        email,
        password,
        role
      };
      addUser(newUser);
      setSuccess(`¡Usuario ${name} agregado exitosamente!`);
    }
    
    // Limpiar y recargar
    handleCancel();
    loadUsers();
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPassword(u.password);
    setRole(u.role);
    setSuccess('');
  };

  const handleDelete = (id) => {
    if (id === user.id) {
      alert("No puedes borrar tu propio usuario mientras tienes la sesión activa.");
      return;
    }
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      deleteUser(id);
      loadUsers();
      if (editingId === id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('');
  };

  return (
    <div className="add-user">
      <div className="page-header">
        <h1>Manage Staff Users</h1>
        <p>Register, edit, or remove coordinators and lab assistants</p>
      </div>

      <div className="users-crud-container">
        {/* Formulario (Crear/Editar) */}
        <div className="card add-user-card">
          <div className="add-user-header">
            <UserPlus size={32} className="add-user-icon" />
            <h2 className="card-title">{editingId ? 'Edit User' : 'New User Details'}</h2>
          </div>
          
          {success && <div className="success-msg">{success}</div>}

          <form className="asset-form user-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Full Name <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g., Ana Gómez" 
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
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Password <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="Nueva contraseña..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <small className="hint">El usuario usará esta contraseña para iniciar sesión.</small>
            </div>

            <div className="form-actions" style={{marginTop: '1rem'}}>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />
                {editingId ? 'Update User' : 'Register User'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="card users-list-card">
          <h2 className="card-title" style={{marginBottom: '1rem'}}>Active Users</h2>
          <div className="users-list">
            {usersList.map((u) => (
              <div key={u.id} className={`user-item ${u.id === user.id ? 'current-user' : ''}`}>
                <div className="user-info">
                  <p className="user-name">{u.name} {u.id === user.id && <span className="you-badge">(Tú)</span>}</p>
                  <p className="user-email">{u.email}</p>
                  <span className="user-role">{u.role}</span>
                </div>
                <div className="user-actions">
                  <button className="btn-icon" onClick={() => handleEdit(u)} title="Editar">
                    <Edit size={16} />
                  </button>
                  {u.id !== user.id && (
                    <button className="btn-icon danger" onClick={() => handleDelete(u.id)} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
