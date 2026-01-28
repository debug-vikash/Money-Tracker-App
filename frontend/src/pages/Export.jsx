import { useState } from 'react';
import api from '../services/api';

const Export = () => {
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('monthly');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [success, setSuccess] = useState('');

    const handleExport = async (format) => {
        setLoading(true);
        setSuccess('');

        try {
            const params = new URLSearchParams({
                type: exportType,
                month: month.toString(),
                year: year.toString()
            });

            const response = await api.get(`/api/export/${format}?${params}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `money-tracker-report-${exportType}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccess(`${format.toUpperCase()} file downloaded successfully!`);
        } catch (error) {
            console.error('Error exporting:', error);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <div className="export-page">
            <div className="page-header">
                <h1>Export Reports</h1>
                <p>Download your financial data as PDF or CSV</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                {success && <div className="alert alert-success">{success}</div>}

                <div className="form-group">
                    <label className="form-label">Report Type</label>
                    <div className="type-toggle">
                        <button
                            type="button"
                            className={exportType === 'daily' ? 'active' : ''}
                            onClick={() => setExportType('daily')}
                        >
                            📅 Daily
                        </button>
                        <button
                            type="button"
                            className={exportType === 'weekly' ? 'active' : ''}
                            onClick={() => setExportType('weekly')}
                        >
                            📈 Weekly
                        </button>
                        <button
                            type="button"
                            className={exportType === 'monthly' ? 'active' : ''}
                            onClick={() => setExportType('monthly')}
                        >
                            📆 Monthly
                        </button>
                    </div>
                </div>

                {exportType === 'monthly' && (
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Month</label>
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
                        <div className="form-group">
                            <label className="form-label">Year</label>
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
                )}

                <div className="grid-2 mt-4">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => handleExport('pdf')}
                        disabled={loading}
                    >
                        📄 Export PDF
                    </button>
                    <button
                        className="btn btn-success btn-lg"
                        onClick={() => handleExport('csv')}
                        disabled={loading}
                    >
                        📊 Export CSV
                    </button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid-2 mt-4" style={{ maxWidth: '600px' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '8px' }}>📄 PDF Format</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Formatted report with summary, charts representation, and transaction details. Best for printing or sharing.
                    </p>
                </div>
                <div className="card">
                    <h4 style={{ marginBottom: '8px' }}>📊 CSV Format</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Raw data export compatible with Excel, Google Sheets, and other spreadsheet applications.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Export;
