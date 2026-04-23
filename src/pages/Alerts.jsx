import { AlertTriangle, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInventory } from '../../server/data/mockData';
import './Inventory.css'; // Reusing Inventory styles as the table layout is the same

export default function Alerts() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load inventory and filter only items requiring attention
    const allItems = getInventory();
    const alertItems = allItems.filter(
      item => item.status?.toLowerCase() === 'review' || item.status?.toLowerCase() === 'critical'
    );
    setItems(alertItems);
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  return (
    <div className="inventory alerts-page">
      <div className="page-header" style={{ borderBottom: '2px solid var(--danger)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={28} color="var(--danger)" />
          <h1 style={{ marginBottom: 0 }}>Critical Alerts</h1>
        </div>
        <p style={{ marginTop: '0.5rem' }}>Items requiring immediate review, maintenance, or replacement</p>
      </div>

      <div className="card inventory-container" style={{ marginTop: '1.5rem', border: '1px solid var(--danger-bg)' }}>
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Lab ID</th>
                <th>Quantity</th>
                <th>Storage Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ backgroundColor: 'var(--warning-bg)' }}>
                  <td className="item-id">{item.id}</td>
                  <td className="item-name">{item.name}</td>
                  <td style={{ fontWeight: 500 }}>{item.lab_id}</td>
                  <td>{item.quantity}</td>
                  <td>{item.storage}</td>
                  <td>
                    <span className={`status-badge review`}>
                      {item.status || 'Review'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(item.id)} title="Resolve Issue">
                      <Edit size={16} /> Resolve
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--success)' }}>
                    All clear! No items currently require review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <p>Showing {items.length} alert(s)</p>
        </div>
      </div>
    </div>
  );
}
