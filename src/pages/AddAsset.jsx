import { Upload, Save } from 'lucide-react';
import './AddAsset.css';

export default function AddAsset() {
  return (
    <div className="add-asset">
      <div className="page-header">
        <h1>Add New Item</h1>
        <p>Enter details to add a new item to the inventory</p>
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
          
          <form className="asset-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group full-width">
              <label>Item Name <span className="required">*</span></label>
              <input type="text" placeholder="e.g., Pipetas de 10ml" />
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select defaultValue="">
                  <option value="" disabled>Select category</option>
                  <option value="vidrieria">Vidriería</option>
                  <option value="reactivos">Reactivos</option>
                  <option value="equipos">Equipos</option>
                  <option value="consumibles">Consumibles</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity <span className="required">*</span></label>
                <input type="number" placeholder="0" />
              </div>
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Serial Number</label>
                <input type="text" placeholder="e.g., SN-12345" />
              </div>
              <div className="form-group">
                <label>Storage Location <span className="required">*</span></label>
                <input type="text" placeholder="e.g., Estante A-3" />
              </div>
            </div>

            <div className="form-group half-width">
              <label>Expiry Date</label>
              <input type="date" />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea placeholder="Additional notes or description..." rows={3}></textarea>
            </div>

            <div className="form-actions">
              <button className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />
                Save Item
              </button>
              <button className="btn-secondary">Clear</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
