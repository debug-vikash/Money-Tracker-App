import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileSuccess('');
        setProfileError('');

        try {
            const response = await api.put('/api/users/me', profileData);
            updateUser(response.data);
            setProfileSuccess('Profile updated successfully!');
        } catch (error) {
            setProfileError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        setPasswordSuccess('');
        setPasswordError('');

        try {
            await api.put('/api/users/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordSuccess('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = () => {
        return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1>Profile</h1>
                <p>Manage your account settings</p>
            </div>

            <div className="grid-2">
                {/* Profile Card */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Profile Information</h3>
                    </div>

                    <div className="flex flex-center gap-4 mb-4" style={{ padding: '16px 0' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'var(--gradient-primary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            fontWeight: '600',
                            color: 'white'
                        }}>
                            {getInitials()}
                        </div>
                        <div>
                            <h3 style={{ marginBottom: '4px' }}>{user?.firstName} {user?.lastName}</h3>
                            <p style={{ color: '#94a3b8' }}>{user?.email}</p>
                            <span className="badge badge-success">{user?.role?.replace('ROLE_', '')}</span>
                        </div>
                    </div>

                    {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
                    {profileError && <div className="alert alert-error">{profileError}</div>}

                    <form onSubmit={handleProfileSubmit}>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                {/* Password Card */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Change Password</h3>
                    </div>

                    {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
                    {passwordError && <div className="alert alert-error">{passwordError}</div>}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                            {passwordLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Logout */}
            <div className="card mt-4" style={{ maxWidth: '400px' }}>
                <h4 style={{ marginBottom: '12px' }}>Sign Out</h4>
                <p style={{ color: '#94a3b8', marginBottom: '16px' }}>
                    Sign out of your account on this device.
                </p>
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
