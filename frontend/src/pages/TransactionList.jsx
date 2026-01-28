import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: '',
        categoryId: ''
    });
    const [editingTx, setEditingTx] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    const fetchTransactions = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.type) params.append('type', filters.type);
            if (filters.categoryId) params.append('categoryId', filters.categoryId);

            const url = params.toString() ? `/api/transactions/filter?${params}` : '/api/transactions';
            const response = await api.get(url);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setLoading(true);
        fetchTransactions();
    };

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', type: '', categoryId: '' });
        setLoading(true);
        setTimeout(fetchTransactions, 0);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/transactions/${id}`);
            setTransactions(transactions.filter(t => t.id !== id));
            setShowDeleteModal(null);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const totals = transactions.reduce((acc, tx) => {
        if (tx.type === 'INCOME') acc.income += tx.amount;
        else acc.expense += tx.amount;
        return acc;
    }, { income: 0, expense: 0 });

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            <div className="page-header">
                <h1>All Transactions</h1>
                <p>View and manage your transactions</p>
            </div>

            {/* Summary */}
            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="label">Total Income</div>
                    <div className="amount">{formatCurrency(totals.income)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="label">Total Expense</div>
                    <div className="amount">{formatCurrency(totals.expense)}</div>
                </div>
                <div className="summary-card balance">
                    <div className="label">Net Balance</div>
                    <div className="amount">{formatCurrency(totals.income - totals.expense)}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="filters">
                    <div className="filter-group">
                        <label className="filter-label">From</label>
                        <input
                            type="date"
                            name="startDate"
                            className="form-input"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">To</label>
                        <input
                            type="date"
                            name="endDate"
                            className="form-input"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Type</label>
                        <select
                            name="type"
                            className="form-select"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Types</option>
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <select
                            name="categoryId"
                            className="form-select"
                            value={filters.categoryId}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <div className="flex gap-2">
                            <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
                            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Transactions ({transactions.length})</h3>
                    <Link to="/transactions/add" className="btn btn-primary btn-sm">+ Add New</Link>
                </div>

                {transactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">No transactions found</div>
                        <p>Try adjusting your filters or add a new transaction</p>
                    </div>
                ) : (
                    <div>
                        {transactions.map(tx => (
                            <div key={tx.id} className="transaction-row">
                                <div
                                    className="transaction-icon"
                                    style={{ backgroundColor: (tx.categoryColor || '#6366f1') + '20' }}
                                >
                                    {tx.categoryIcon || '💳'}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">{tx.categoryName}</div>
                                    <div className="transaction-date">
                                        {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        {tx.notes && ` • ${tx.notes}`}
                                    </div>
                                </div>
                                <div className={`transaction-amount ${tx.type.toLowerCase()}`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                                <div className="flex gap-2" style={{ marginLeft: '16px' }}>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setShowDeleteModal(tx)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Delete Transaction</h3>
                            <button className="modal-close" onClick={() => setShowDeleteModal(null)}>&times;</button>
                        </div>
                        <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleDelete(showDeleteModal.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
