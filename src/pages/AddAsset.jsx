import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Save } from 'lucide-react';
import { getInventoryById, addInventoryItem, updateInventoryItem } from '../../server/data/mockData';
import './AddAsset.css';

export default function AddAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // State del formulario (Temporal para futuro PostgreSQL)
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [labId, setLabId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [storage, setStorage] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Normal');

  // Carga los datos del item solo si se está editando
  useEffect(() => {
    if (isEditing) {
      const itemToEdit = getInventoryById(id);
      if (itemToEdit) {
        setName(itemToEdit.name || '');
        setCategory(itemToEdit.category || '');
        setQuantity(itemToEdit.quantity || '');
        setLabId(itemToEdit.lab_id || '');
        setSerialNumber(itemToEdit.serialNumber || '');
        setStorage(itemToEdit.storage || '');
        setExpiryDate(itemToEdit.expiryDate || '');
        setDescription(itemToEdit.description || '');
        setStatus(itemToEdit.status || 'Normal');
      } else {
        alert("El activo no fue encontrado");
        navigate('/inventory');
      }
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const assetData = {
      id: isEditing ? id : `ITM-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name,
      category,
      quantity: Number(quantity),
      lab_id: labId,
      serialNumber,
      storage,
      expiryDate,
      description,
      status
    };

    if (isEditing) {
      updateInventoryItem(id, assetData);
    } else {
      addInventoryItem(assetData);
    }

    navigate('/inventory');
  };

  return (
    <div className="add-asset">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Item' : 'Add New Item'}</h1>
        <p>{isEditing ? 'Update the details of the selected item' : 'Enter details to add a new item to the inventory'}</p>
      </div>

      <div className="add-asset-content">
        <div className="card image-upload-card">
          <p className="card-title">Product Image</p>
          <div className="upload-dropzone">
            <Upload size={32} className="upload-icon" />
            <p>Upload product image</p>
            <button className="upload-btn">Choose File</button>
          </div>
        </div>

        <div className="card details-card">
          <p className="card-title">Item Details</p>

          <form className="asset-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Item Name <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Pipetas de 10ml"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="" disabled>Select category</option>
                  <option value="Vidriería">Vidriería</option>
                  <option value="Reactivos">Reactivos</option>
                  <option value="Equipos">Equipos</option>
                  <option value="Equipo de Protección">Equipo de Protección</option>
                  <option value="Consumibles">Consumibles</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity <span className="required">*</span></label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Lab ID <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., LAB-01"
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Serial Number</label>
                <input
                  type="text"
                  placeholder="e.g., SN-12345"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Storage Location <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., Estante A-3"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="Review">Review / Mantenimiento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                placeholder="Additional notes or description..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />
                {isEditing ? 'Save Changes' : 'Save Item'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/inventory')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
