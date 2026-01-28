import { useState, useEffect } from 'react';
import api from '../services/api';

const DailyReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [date]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/reports/daily?date=${date}`);
            setReport(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="daily-report">
            <div className="page-header">
                <h1>Daily Report</h1>
                <p>View transactions for a specific day</p>
            </div>

            {/* Date Selector */}
            <div className="card mb-4" style={{ maxWidth: '300px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Date</label>
                    <input
                        type="date"
                        className="form-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="icon">📈</div>
                    <div className="label">Income</div>
                    <div className="amount">{formatCurrency(report?.totalIncome)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="icon">📉</div>
                    <div className="label">Expense</div>
                    <div className="amount">{formatCurrency(report?.totalExpense)}</div>
                </div>
                <div className="summary-card balance">
                    <div className="icon">💰</div>
                    <div className="label">Net</div>
                    <div className="amount">{formatCurrency(report?.netBalance)}</div>
                </div>
            </div>

            {/* Transactions */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        Transactions for {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>
                    <span className="badge badge-success">{report?.transactionCount || 0} transactions</span>
                </div>

                {!report?.transactions?.length ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <div className="empty-state-title">No transactions</div>
                        <p>There are no transactions for this date</p>
                    </div>
                ) : (
                    <div>
                        {report.transactions.map(tx => (
                            <div key={tx.id} className="transaction-row">
                                <div
                                    className="transaction-icon"
                                    style={{ backgroundColor: (tx.categoryColor || '#6366f1') + '20' }}
                                >
                                    {tx.categoryIcon || '💳'}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">{tx.categoryName}</div>
                                    <div className="transaction-date">{tx.notes || 'No notes'}</div>
                                </div>
                                <div className={`transaction-amount ${tx.type.toLowerCase()}`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyReport;
