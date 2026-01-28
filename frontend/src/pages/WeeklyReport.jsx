import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const WeeklyReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const response = await api.get('/api/reports/weekly');
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

    const chartData = {
        labels: report?.dailySummaries?.map(d =>
            new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        ) || [],
        datasets: [
            {
                label: 'Income',
                data: report?.dailySummaries?.map(d => d.income) || [],
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: '#10b981',
                borderWidth: 2,
                borderRadius: 6,
            },
            {
                label: 'Expense',
                data: report?.dailySummaries?.map(d => d.expense) || [],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: '#ef4444',
                borderWidth: 2,
                borderRadius: 6,
            }
        ]
    };

    const lineData = {
        labels: report?.dailySummaries?.map(d =>
            new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
        ) || [],
        datasets: [
            {
                label: 'Net Balance',
                data: report?.dailySummaries?.map(d => d.net) || [],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
            }
        ]
    };

    const chartOptions = {
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
        <div className="weekly-report">
            <div className="page-header">
                <h1>Weekly Report</h1>
                <p>Last 7 days financial summary</p>
            </div>

            {/* Summary */}
            <div className="summary-grid">
                <div className="summary-card income">
                    <div className="icon">📈</div>
                    <div className="label">Total Income</div>
                    <div className="amount">{formatCurrency(report?.totalIncome)}</div>
                </div>
                <div className="summary-card expense">
                    <div className="icon">📉</div>
                    <div className="label">Total Expense</div>
                    <div className="amount">{formatCurrency(report?.totalExpense)}</div>
                </div>
                <div className="summary-card balance">
                    <div className="icon">💰</div>
                    <div className="label">Net Balance</div>
                    <div className="amount">{formatCurrency(report?.netBalance)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Daily Breakdown</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Balance Trend</h3>
                    </div>
                    <div className="chart-container">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Daily Summary Table */}
            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Daily Summary</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Income</th>
                                <th>Expense</th>
                                <th>Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report?.dailySummaries?.map((day, i) => (
                                <tr key={i}>
                                    <td>{new Date(day.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                    })}</td>
                                    <td style={{ color: '#10b981' }}>{formatCurrency(day.income)}</td>
                                    <td style={{ color: '#ef4444' }}>{formatCurrency(day.expense)}</td>
                                    <td style={{ color: day.net >= 0 ? '#10b981' : '#ef4444' }}>
                                        {formatCurrency(day.net)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WeeklyReport;
