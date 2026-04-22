import { Package, AlertCircle, Clock } from 'lucide-react';
import { recentActivity } from '../../server/data/mockData';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="search-bar">
        <input type="text" placeholder="Search inventory items..." />
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card primary-kpi">
          <div className="kpi-content">
            <p className="kpi-label">Total Items</p>
            <h3>1,247</h3>
            <p className="kpi-subtext success-text">↑ 12% from last month</p>
          </div>
          <div className="kpi-icon primary-icon-bg">
            <Package size={24} className="primary-icon" />
          </div>
        </div>

        <div className="card kpi-card danger-kpi">
          <div className="kpi-content">
            <p className="kpi-label">Expired Items</p>
            <h3 className="danger-text">7</h3>
            <p className="kpi-subtext">Requires immediate attention</p>
          </div>
          <div className="kpi-icon danger-icon-bg">
            <Clock size={24} className="danger-icon" />
          </div>
        </div>
      </div>

      <div className="card recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className={`activity-icon-container ${activity.type}`}>
                <Package size={16} />
              </div>
              <div className="activity-details">
                <p className="activity-user">{activity.user}</p>
                <p className="activity-action">{activity.action}</p>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
