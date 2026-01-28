import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MonthlyReport = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [month, year]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/reports/monthly?month=${month}&year=${year}`);
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

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const barData = {
        labels: ['Income', 'Expense'],
        datasets: [{
            data: [report?.totalIncome || 0, report?.totalExpense || 0],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    const doughnutData = {
        labels: ['Income', 'Expense'],
        datasets: [{
            data: [report?.totalIncome || 0, report?.totalExpense || 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
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
        <div className="monthly-report">
            <div className="page-header">
                <h1>Monthly Report</h1>
                <p>Detailed monthly financial analysis</p>
            </div>

            {/* Month Selector */}
            <div className="card mb-4">
                <div className="filters">
                    <div className="filter-group">
                        <label className="filter-label">Month</label>
                        <select
                            className="form-select"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Year</label>
                        <select
                            className="form-select"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
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
                    <div className="label">Net Savings</div>
                    <div className="amount">{formatCurrency(report?.netBalance)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Income vs Expense</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Distribution</h3>
                    </div>
                    <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '220px', height: '220px' }}>
                            <Doughnut
                                data={doughnutData}
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

            {/* Stats */}
            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Statistics</h3>
                </div>
                <div className="grid-2">
                    <div>
                        <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Transactions</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>{report?.transactionCount || 0}</p>
                    </div>
                    <div>
                        <p style={{ color: '#94a3b8', marginBottom: '8px' }}>Savings Rate</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '600', color: report?.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                            {report?.totalIncome > 0
                                ? `${((report.netBalance / report.totalIncome) * 100).toFixed(1)}%`
                                : '0%'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyReport;
