import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = () => {
        if (!user) return '?';
        return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">💰</div>
                        <span className="sidebar-logo-text">MoneyTracker</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">Overview</div>
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📊</span>
                            Dashboard
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Transactions</div>
                        <NavLink to="/transactions/add" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">➕</span>
                            Add Transaction
                        </NavLink>
                        <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📋</span>
                            All Transactions
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Reports</div>
                        <NavLink to="/reports/daily" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📅</span>
                            Daily Report
                        </NavLink>
                        <NavLink to="/reports/weekly" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📈</span>
                            Weekly Report
                        </NavLink>
                        <NavLink to="/reports/monthly" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📆</span>
                            Monthly Report
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">Analytics</div>
                        <NavLink to="/analysis" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">🔄</span>
                            Category Analysis
                        </NavLink>
                        <NavLink to="/budget" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">💵</span>
                            Budget
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">More</div>
                        <NavLink to="/export" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">📥</span>
                            Export Reports
                        </NavLink>
                        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <span className="nav-link-icon">👤</span>
                            Profile
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info" onClick={handleLogout}>
                        <div className="user-avatar">{getInitials()}</div>
                        <div className="user-details">
                            <div className="user-name">{user?.firstName} {user?.lastName}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-nav">
                <div className="mobile-nav-items">
                    <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                        <span>📊</span>
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/transactions" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                        <span>📋</span>
                        <span>Transactions</span>
                    </NavLink>
                    <NavLink to="/transactions/add" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                        <span>➕</span>
                        <span>Add</span>
                    </NavLink>
                    <NavLink to="/analysis" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                        <span>📈</span>
                        <span>Analysis</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
                        <span>👤</span>
                        <span>Profile</span>
                    </NavLink>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
