import { Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventory, deleteInventoryItem } from '../../server/data/mockData';
import './Inventory.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos al iniciar el componente (esto luego será un fetch a Postgres)
    setItems(getInventory());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este activo? Esta acción no se puede deshacer.')) {
      deleteInventoryItem(id); // Borrar en "DB"
      setItems(getInventory()); // Refrescar estado local
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="inventory">
      <div className="page-header">
        <h1>Current Inventory</h1>
        <p>Manage and track all laboratory items</p>
      </div>

      <div className="card inventory-container">
        <div className="inventory-actions">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search by item name or ID..." />
          </div>

          <div className="filters">
            <div className="filter-select">
              <Filter size={16} />
              <select>
                <option>All Categories</option>
              </select>
            </div>
            <div className="filter-select">
              <select>
                <option>All Status</option>
              </select>
            </div>
            <button className="btn-primary">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Lab ID</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="item-id">{item.id}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.category}</td>
                  <td style={{ fontWeight: 500 }}>{item.lab_id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.storage}</td>
                  <td>
                    <span className={`status-badge ${item.status?.toLowerCase().replace(' ', '-') || 'normal'}`}>
                      {item.status || 'Normal'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => setSelectedItem(item)} title="Ver Descripción">
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(item.id)} title="Editar">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Eliminar" style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <p>Showing {items.length} of {items.length} items</p>
        </div>
      </div>

      {/* Ventana Modal para agregar items */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.4rem' }}>{selectedItem.name}</h2>
            </div>

            <div className="modal-body">
              <img
                src={selectedItem.image || 'https://via.placeholder.com/500x300?text=Placeholder+Image'}
                alt={selectedItem.name}
                className="modal-image"
              />
              <div className="modal-details">
                <p><strong>Descripción:</strong> {selectedItem.description || 'Sin descripción detallada para este activo. Este valor será traído de PostgreSQL en el futuro.'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '8px' }}>
                  <p><strong>ID:</strong> {selectedItem.id}</p>
                  <p><strong>Categoría:</strong> {selectedItem.category}</p>
                  <p><strong>Laboratorio:</strong> {selectedItem.lab_id}</p>
                  <p><strong>Ubicación:</strong> {selectedItem.storage}</p>
                  <p><strong>Cantidad:</strong> {selectedItem.quantity}</p>
                  <p><strong>Status:</strong> {selectedItem.status}</p>
                </div>
              </div>
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-primary" onClick={() => setSelectedItem(null)}>Cerrar Ventana</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
