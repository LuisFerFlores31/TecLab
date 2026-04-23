import { Search, Filter, Download, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventory, deleteInventoryItem } from '../../server/data/mockData';
import './Inventory.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
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
                <th>Storage Location</th>
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
                  <td style={{fontWeight: 500}}>{item.lab_id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.storage}</td>
                  <td>
                    <span className={`status-badge ${item.status?.toLowerCase().replace(' ', '-') || 'normal'}`}>
                      {item.status || 'Normal'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <p>Showing {items.length} of {items.length} items</p>
        </div>
      </div>
    </div>
  );
}
