import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CategoryAnalysis = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get(
                `/api/reports/category-analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
            );
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
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

    const expenseChartData = {
        labels: analytics?.expenseByCategory?.map(c => c.categoryName) || [],
        datasets: [{
            data: analytics?.expenseByCategory?.map(c => c.amount) || [],
            backgroundColor: analytics?.expenseByCategory?.map(c => c.categoryColor || '#6366f1') || [],
            borderWidth: 0,
        }]
    };

    const incomeChartData = {
        labels: analytics?.incomeByCategory?.map(c => c.categoryName) || [],
        datasets: [{
            data: analytics?.incomeByCategory?.map(c => c.amount) || [],
            backgroundColor: analytics?.incomeByCategory?.map(c => c.categoryColor || '#10b981') || [],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: analytics?.expenseByCategory?.map(c => c.categoryName) || [],
        datasets: [{
            label: 'Amount',
            data: analytics?.expenseByCategory?.map(c => c.amount) || [],
            backgroundColor: analytics?.expenseByCategory?.map(c => c.categoryColor || '#6366f1') || [],
            borderRadius: 6,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#94a3b8',
                    padding: 16,
                    usePointStyle: true,
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: '#334155' },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="category-analysis">
            <div className="page-header">
                <h1>Category Analysis</h1>
                <p>Breakdown of spending and income by category</p>
            </div>

            {/* Date Range */}
            <div className="card mb-4">
                <div className="filters">
                    <div className="filter-group">
                        <label className="filter-label">From</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">To</label>
                        <input
                            type="date"
                            className="form-input"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="summary-card income">
                    <div className="label">Total Income</div>
                    <div className="amount">{formatCurrency(analytics?.totalIncome)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="label">Total Expense</div>
                    <div className="amount">{formatCurrency(analytics?.totalExpense)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Expense by Category</h3>
                    </div>
                    {analytics?.expenseByCategory?.length > 0 ? (
                        <div className="chart-container" style={{ height: '350px' }}>
                            <Pie data={expenseChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No expense data available</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Income by Category</h3>
                    </div>
                    {analytics?.incomeByCategory?.length > 0 ? (
                        <div className="chart-container" style={{ height: '350px' }}>
                            <Pie data={incomeChartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No income data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Expense Breakdown Bar Chart */}
            {analytics?.expenseByCategory?.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <h3 className="card-title">Expense Breakdown</h3>
                    </div>
                    <div className="chart-container" style={{ height: `${Math.max(200, analytics.expenseByCategory.length * 40)}px` }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            )}

            {/* Category Details */}
            <div className="grid-2 mt-4">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top Expenses</h3>
                    </div>
                    {analytics?.expenseByCategory?.slice(0, 5).map((cat, i) => (
                        <div key={i} className="transaction-row">
                            <div
                                className="transaction-icon"
                                style={{ backgroundColor: (cat.categoryColor || '#ef4444') + '20' }}
                            >
                                {cat.categoryIcon || '💳'}
                            </div>
                            <div className="transaction-info">
                                <div className="transaction-category">{cat.categoryName}</div>
                                <div className="transaction-date">{cat.percentage?.toFixed(1)}% of total</div>
                            </div>
                            <div className="transaction-amount expense">
                                {formatCurrency(cat.amount)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Income Sources</h3>
                    </div>
                    {analytics?.incomeByCategory?.map((cat, i) => (
                        <div key={i} className="transaction-row">
                            <div
                                className="transaction-icon"
                                style={{ backgroundColor: (cat.categoryColor || '#10b981') + '20' }}
                            >
                                {cat.categoryIcon || '💰'}
                            </div>
                            <div className="transaction-info">
                                <div className="transaction-category">{cat.categoryName}</div>
                                <div className="transaction-date">{cat.percentage?.toFixed(1)}% of total</div>
                            </div>
                            <div className="transaction-amount income">
                                {formatCurrency(cat.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryAnalysis;
