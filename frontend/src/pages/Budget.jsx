import { useState, useEffect } from 'react';
import api from '../services/api';

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    const fetchBudgets = async () => {
        try {
            const response = await api.get('/api/budgets/status');
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            setCategories(response.data.filter(c => c.type === 'EXPENSE'));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/budgets', {
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
            });
            setShowModal(false);
            setFormData({
                amount: '',
                categoryId: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
            });
            fetchBudgets();
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/budgets/${id}`);
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const getProgressClass = (percentage) => {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'safe';
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="budget-page">
            <div className="page-header">
                <h1>Budget Management</h1>
                <p>Set and track your spending limits</p>
            </div>

            <button className="btn btn-primary mb-4" onClick={() => setShowModal(true)}>
                + Add Budget
            </button>

            {budgets.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">💵</div>
                        <div className="empty-state-title">No budgets set</div>
                        <p>Create your first budget to start tracking your spending limits</p>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {budgets.map(budget => (
                        <div key={budget.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{budget.categoryName}</h3>
                                {budget.exceeded && (
                                    <span className="badge badge-danger">Exceeded</span>
                                )}
                            </div>

                            <div className="budget-progress">
                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${getProgressClass(budget.percentageUsed)}`}
                                        style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                                    />
                                </div>
                                <div className="budget-info">
                                    <span>Spent: {formatCurrency(budget.spentAmount)}</span>
                                    <span>Budget: {formatCurrency(budget.budgetAmount)}</span>
                                </div>
                            </div>

                            <div className="flex flex-between flex-center mt-4">
                                <div>
                                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Remaining: </span>
                                    <span style={{
                                        fontWeight: '600',
                                        color: budget.remainingAmount >= 0 ? '#10b981' : '#ef4444'
                                    }}>
                                        {formatCurrency(budget.remainingAmount)}
                                    </span>
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleDelete(budget.id)}
                                >
                                    Delete
                                </button>
                            </div>

                            {budget.exceeded && (
                                <div className="alert alert-warning mt-4" style={{ marginBottom: 0 }}>
                                    ⚠️ You've exceeded your budget by {formatCurrency(Math.abs(budget.remainingAmount))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Budget Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Budget</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category (optional)</label>
                                <select
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Overall Budget</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Budget Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Month</label>
                                    <select
                                        className="form-select"
                                        value={formData.month}
                                        onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                    >
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <select
                                        className="form-select"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    >
                                        {[2024, 2025, 2026].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Budget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;
