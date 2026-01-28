import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddTransaction = () => {
    const [formData, setFormData] = useState({
        amount: '',
        type: 'EXPENSE',
        categoryId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'type' ? { categoryId: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/api/transactions', {
                ...formData,
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId)
            });

            setSuccess('Transaction added successfully!');
            setFormData({
                amount: '',
                type: 'EXPENSE',
                categoryId: '',
                transactionDate: new Date().toISOString().split('T')[0],
                notes: ''
            });

            setTimeout(() => {
                navigate('/transactions');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === formData.type);

    return (
        <div className="add-transaction">
            <div className="page-header">
                <h1>Add Transaction</h1>
                <p>Record your income or expense</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Type Toggle */}
                    <div className="form-group">
                        <label className="form-label">Transaction Type</label>
                        <div className="type-toggle">
                            <button
                                type="button"
                                className={`income ${formData.type === 'INCOME' ? 'active' : ''}`}
                                onClick={() => handleChange({ target: { name: 'type', value: 'INCOME' } })}
                            >
                                💰 Income
                            </button>
                            <button
                                type="button"
                                className={`expense ${formData.type === 'EXPENSE' ? 'active' : ''}`}
                                onClick={() => handleChange({ target: { name: 'type', value: 'EXPENSE' } })}
                            >
                                💸 Expense
                            </button>
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                            name="categoryId"
                            className="form-select"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {filteredCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.icon} {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            name="transactionDate"
                            className="form-input"
                            value={formData.transactionDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            className="form-textarea"
                            placeholder="Add a note about this transaction..."
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransaction;
