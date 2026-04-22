import { Search, Filter, Download, Eye } from 'lucide-react';
import { inventoryItems } from '../../server/data/mockData';
import './Inventory.css';

export default function Inventory() {
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
                <th>Storage Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td className="item-id">{item.id}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.storage}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon">
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <p>Showing {inventoryItems.length} of {inventoryItems.length} items</p>
        </div>
      </div>
    </div>
  );
}
