import { useState } from 'react';
import { getUsers } from '../../server/data/usersData';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous error

    // Validate if the user exists
    const userFound = getUsers().find(
      (u) => u.email === email && u.password === password
    );

    if (userFound) {
      onLogin(userFound); // Set user session in App.jsx
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <h2>Lab Inventory</h2>
          <p>Tec de Monterrey</p>
          <span className="login-subtitle">Acceso de Personal</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label>Correo Institucional</label>
            <input
              type="email"
              placeholder="usuario@tec.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary login-btn">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
