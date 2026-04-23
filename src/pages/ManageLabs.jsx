import { useState, useEffect } from 'react';
import { Beaker, Save, Edit, Trash2 } from 'lucide-react';
import { getLabs, addLab, updateLab, deleteLab } from '../../server/data/labsData';
import { Navigate } from 'react-router-dom';
import './ManageLabs.css'; // Mismo diseño grid que Manage Users

export default function ManageLabs({ user }) {
  const [labsList, setLabsList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [labId, setLabId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [coordinador, setCoordinador] = useState('');
  const [success, setSuccess] = useState('');

  // Proteger la ruta: Si no es Coordinador, redirigir al Dashboard
  if (!user || user.role !== 'Coordinador') {
    return <Navigate to="/" />;
  }

  const loadLabs = () => {
    setLabsList(getLabs());
  };

  useEffect(() => {
    loadLabs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess('');

    if (editingId) {
      // Modo Edición
      updateLab(editingId, { name, description, area, coordinador });
      setSuccess(`¡Laboratorio ${name} actualizado exitosamente!`);
    } else {
      // Modo Creación
      const currentLabs = getLabs();
      const exists = currentLabs.find(l => l.lab_id === labId);
      if (exists) {
        alert('Ese Lab ID ya se encuentra registrado. Utiliza un ID diferente.');
        return;
      }

      const newLab = {
        lab_id: labId,
        name,
        description,
        area,
        coordinador
      };
      addLab(newLab);
      setSuccess(`¡Laboratorio ${name} agregado exitosamente!`);
    }
    
    // Limpiar y recargar
    handleCancel();
    loadLabs();
  };

  const handleEdit = (lab) => {
    setEditingId(lab.lab_id);
    setLabId(lab.lab_id);
    setName(lab.name);
    setDescription(lab.description);
    setArea(lab.area);
    setCoordinador(lab.coordinador);
    setSuccess('');
  };

  const handleDelete = (lab_id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este laboratorio? Los activos podrían quedar sin laboratorio asignado.")) {
      deleteLab(lab_id);
      loadLabs();
      if (editingId === lab_id) handleCancel();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setLabId('');
    setName('');
    setDescription('');
    setArea('');
    setCoordinador('');
  };

  return (
    <div className="add-user manage-labs">
      <div className="page-header">
        <h1>Manage Laboratories</h1>
        <p>Register, edit, or remove laboratories</p>
      </div>

      <div className="users-crud-container">
        {/* Formulario (Crear/Editar) */}
        <div className="card add-user-card">
          <div className="add-user-header">
            <Beaker size={32} className="add-user-icon" />
            <h2 className="card-title">{editingId ? 'Edit Laboratory' : 'New Laboratory Details'}</h2>
          </div>
          
          {success && <div className="success-msg">{success}</div>}

          <form className="asset-form user-form" onSubmit={handleSubmit}>
            <div className="form-split">
              <div className="form-group">
                <label>Lab ID <span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., LAB-05" 
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  disabled={Boolean(editingId)} // No se puede editar la llave primaria
                  required 
                />
              </div>
              <div className="form-group">
                <label>Laboratory Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Laboratorio Central" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Area / Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., Aulas 4" 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Coordinator <span className="required">*</span></label>
                <input 
                  type="text" 
                  placeholder="e.g., Laura Martinez" 
                  value={coordinador}
                  onChange={(e) => setCoordinador(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea 
                placeholder="Description or primary use of the lab..." 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-actions" style={{marginTop: '1rem'}}>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />
                {editingId ? 'Update Lab' : 'Register Lab'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Laboratorios */}
        <div className="card users-list-card">
          <h2 className="card-title" style={{marginBottom: '1rem'}}>Active Laboratories</h2>
          <div className="users-list">
            {labsList.map((l) => (
              <div key={l.lab_id} className="user-item">
                <div className="user-info">
                  <p className="user-name">{l.name} <span className="user-role">{l.lab_id}</span></p>
                  <p className="user-email">{l.area} • Coord: {l.coordinador}</p>
                  {l.description && <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>{l.description}</p>}
                </div>
                <div className="user-actions">
                  <button className="btn-icon" onClick={() => handleEdit(l)} title="Editar">
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(l.lab_id)} title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {labsList.length === 0 && (
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>No labs created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
