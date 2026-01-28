import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dailyRes, weeklyRes, transactionsRes] = await Promise.all([
                api.get('/api/reports/daily'),
                api.get('/api/reports/weekly'),
                api.get('/api/transactions')
            ]);

            setReport(dailyRes.data);
            setWeeklyReport(weeklyRes.data);
            setRecentTransactions(transactionsRes.data.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    const chartData = {
        labels: ['Income', 'Expense'],
        datasets: [{
            data: [weeklyReport?.totalIncome || 0, weeklyReport?.totalExpense || 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const barChartData = {
        labels: weeklyReport?.dailySummaries?.map(d =>
            new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
        ) || [],
        datasets: [
            {
                label: 'Income',
                data: weeklyReport?.dailySummaries?.map(d => d.income) || [],
                backgroundColor: '#10b981',
                borderRadius: 6,
            },
            {
                label: 'Expense',
                data: weeklyReport?.dailySummaries?.map(d => d.expense) || [],
                backgroundColor: '#ef4444',
                borderRadius: 6,
            }
        ]
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8' }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: '#334155' },
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
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your financial activity</p>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="icon">📈</div>
                    <div className="label">Today's Income</div>
                    <div className="amount">{formatCurrency(report?.totalIncome)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="icon">📉</div>
                    <div className="label">Today's Expense</div>
                    <div className="amount">{formatCurrency(report?.totalExpense)}</div>
                </div>
                <div className="summary-card balance">
                    <div className="icon">💰</div>
                    <div className="label">This Week's Balance</div>
                    <div className="amount">{formatCurrency(weeklyReport?.netBalance)}</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Weekly Overview</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Income vs Expense</h3>
                    </div>
                    <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut
                                data={chartData}
                                options={{
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { color: '#94a3b8' }
                                        }
                                    },
                                    cutout: '70%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Recent Transactions</h3>
                    <Link to="/transactions" className="btn btn-outline btn-sm">View All</Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <div className="empty-state-title">No transactions yet</div>
                        <p>Start tracking your income and expenses</p>
                        <Link to="/transactions/add" className="btn btn-primary mt-4">Add Transaction</Link>
                    </div>
                ) : (
                    <div>
                        {recentTransactions.map(tx => (
                            <div key={tx.id} className="transaction-row">
                                <div
                                    className="transaction-icon"
                                    style={{ backgroundColor: tx.categoryColor + '20' }}
                                >
                                    {tx.categoryIcon || '💳'}
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-category">{tx.categoryName}</div>
                                    <div className="transaction-date">
                                        {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                        {tx.notes && ` • ${tx.notes}`}
                                    </div>
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

export default Dashboard;
