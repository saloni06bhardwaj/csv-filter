import React, { useState, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import { 
  Database, Upload, Search, Download, Filter, 
  ChevronUp, ChevronDown, ChevronsUpDown, X, 
  Sun, Moon, Eye, EyeOff, Trash2, CheckSquare, Square,
  BarChart3, PieChart, LineChart, TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './App.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PAGE_SIZE = 10;

export default function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState('light');
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Chart states
  const [showCharts, setShowCharts] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [selectedChartColumn, setSelectedChartColumn] = useState('');
  const [chartLimit, setChartLimit] = useState(10);

  const handleFileUpload = useCallback((file) => {
    if (!file || !file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 0) {
          setData(results.data);
          setColumns(Object.keys(results.data[0]));
          setFileName(file.name);
          setColumnFilters({});
          setGlobalSearch('');
          setSortConfig({ column: null, direction: 'asc' });
          setCurrentPage(1);
          setSelectedRows(new Set());
          setHiddenColumns(new Set());
          setShowCharts(false);
          setSelectedChartColumn('');
        }
      },
      error: () => alert('Failed to parse CSV file')
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  }, [handleFileUpload]);

  const handleSort = (column) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (column) => {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      next.has(column) ? next.delete(column) : next.add(column);
      return next;
    });
  };

  const toggleRowSelection = (index) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((_, i) => i)));
    }
  };

  const deleteSelected = () => {
    if (selectedRows.size === 0) return;
    const newData = data.filter((_, i) => !selectedRows.has(i));
    setData(newData);
    setSelectedRows(new Set());
  };

  const exportToCSV = () => {
    const visibleCols = columns.filter(col => !hiddenColumns.has(col));
    const csvContent = [
      visibleCols.join(','),
      ...filteredData.map(row => 
        visibleCols.map(col => {
          const val = row[col] || '';
          return val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-${fileName || 'data.csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch('');
    setCurrentPage(1);
  };

  const resetApp = () => {
    setData([]);
    setColumns([]);
    setFileName('');
    setColumnFilters({});
    setGlobalSearch('');
    setSortConfig({ column: null, direction: 'asc' });
    setCurrentPage(1);
    setSelectedRows(new Set());
    setHiddenColumns(new Set());
    setShowCharts(false);
  };

  const filteredData = useMemo(() => {
    let result = data.filter(row => {
      const matchesGlobal = globalSearch
        ? Object.values(row).some(val => 
            String(val).toLowerCase().includes(globalSearch.toLowerCase())
          )
        : true;

      const matchesColumns = Object.entries(columnFilters).every(([col, filter]) => {
        if (!filter) return true;
        return String(row[col] || '').toLowerCase().includes(filter.toLowerCase());
      });

      return matchesGlobal && matchesColumns;
    });

    if (sortConfig.column) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.column] || '';
        const bVal = b[sortConfig.column] || '';
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        let comparison = 0;
        if (!isNaN(aNum) && !isNaN(bNum)) {
          comparison = aNum - bNum;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, globalSearch, columnFilters, sortConfig]);

  // Chart data generation
  const chartData = useMemo(() => {
    if (!selectedChartColumn || filteredData.length === 0) return null;

    const valueCounts = {};
    filteredData.forEach(row => {
      const value = String(row[selectedChartColumn] || 'N/A');
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });

    const sortedEntries = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, chartLimit);

    const labels = sortedEntries.map(([label]) => label);
    const values = sortedEntries.map(([, count]) => count);

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
    ];

    return {
      labels,
      datasets: [{
        label: selectedChartColumn,
        data: values,
        backgroundColor: chartType === 'pie' 
          ? colors.slice(0, labels.length)
          : 'rgba(59, 130, 246, 0.8)',
        borderColor: chartType === 'pie'
          ? colors.slice(0, labels.length)
          : 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      }]
    };
  }, [filteredData, selectedChartColumn, chartLimit, chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: chartType === 'pie' ? 'right' : 'top',
        labels: {
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          font: { size: 11 },
          boxWidth: 12,
          padding: 8,
          ...(chartType === 'pie' && chartLimit > 10 ? {
            font: { size: 9 },
            boxWidth: 10,
            padding: 5
          } : {})
        },
        ...(chartType === 'pie' && chartLimit > 10 ? {
          maxHeight: 300,
          display: true
        } : {})
      },
      title: {
        display: true,
        text: `${selectedChartColumn} Distribution (Top ${chartLimit})`,
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        titleColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
        borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.y || context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        ticks: { 
          color: theme === 'dark' ? '#cbd5e1' : '#475569',
          font: { size: 11 }
        },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' }
      },
      x: {
        ticks: { 
          color: theme === 'dark' ? '#cbd5e1' : '#475569',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false
        },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' }
      }
    } : {}
  };

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col));
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const hasActiveFilters = globalSearch || Object.values(columnFilters).some(Boolean);

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo">
              <Database size={32} />
              <div>
                <h1>CSV Master Pro</h1>
                <p>Data Viewer & Analytics</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            {data.length > 0 && (
              <>
                <button 
                  className={`icon-btn ${showCharts ? 'active' : ''}`}
                  onClick={() => setShowCharts(!showCharts)} 
                  title="Toggle Charts"
                >
                  <TrendingUp size={20} />
                </button>
                <button className="icon-btn" onClick={() => setShowColumnPanel(!showColumnPanel)} title="Manage Columns">
                  {showColumnPanel ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button className="icon-btn" onClick={exportToCSV} title="Export CSV">
                  <Download size={20} />
                </button>
              </>
            )}
            <button className="icon-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Upload Area */}
        {data.length === 0 && (
          <div 
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload size={48} />
            <h2>Drop your CSV file here</h2>
            <p>or click to browse</p>
            <label className="upload-btn">
              Choose File
              <input 
                type="file" 
                accept=".csv" 
                onChange={(e) => handleFileUpload(e.target.files[0])} 
                hidden 
              />
            </label>
            <div className="upload-features">
              <span>✓ Advanced filtering</span>
              <span>✓ Smart sorting</span>
              <span>✓ Visual analytics</span>
            </div>
          </div>
        )}

        {/* Data View */}
        {data.length > 0 && (
          <div className="data-view">
            
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-card">
                <span className="stat-label">Total Rows</span>
                <span className="stat-value">{data.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Filtered</span>
                <span className="stat-value">{filteredData.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Columns</span>
                <span className="stat-value">{visibleColumns.length}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Selected</span>
                <span className="stat-value">{selectedRows.size}</span>
              </div>
            </div>

            {/* Control Bar */}
            <div className="control-bar">
              <div className="file-info">
                <span className="file-name">📄 {fileName}</span>
                <button className="text-btn" onClick={resetApp}>Upload New</button>
              </div>
              <div className="control-actions">
                {selectedRows.size > 0 && (
                  <button className="danger-btn" onClick={deleteSelected}>
                    <Trash2 size={16} /> Delete ({selectedRows.size})
                  </button>
                )}
                <button className="primary-btn" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={16} /> {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Charts Section */}
            {showCharts && (
              <div className="charts-section">
                <div className="charts-header">
                  <h2>📊 Visual Analytics</h2>
                  <button className="text-btn" onClick={() => setShowCharts(false)}>
                    <X size={16} /> Close
                  </button>
                </div>

                <div className="chart-controls">
                  <div className="control-group">
                    <label>Select Column</label>
                    <select 
                      value={selectedChartColumn} 
                      onChange={(e) => setSelectedChartColumn(e.target.value)}
                    >
                      <option value="">Choose a column...</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Chart Type</label>
                    <div className="chart-type-buttons">
                      <button 
                        className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                        onClick={() => setChartType('bar')}
                      >
                        <BarChart3 size={18} /> Bar
                      </button>
                      <button 
                        className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                        onClick={() => setChartType('pie')}
                      >
                        <PieChart size={18} /> Pie
                      </button>
                      <button 
                        className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => setChartType('line')}
                      >
                        <LineChart size={18} /> Line
                      </button>
                    </div>
                  </div>

                  <div className="control-group">
                    <label>Show Top</label>
                    <select 
                      value={chartLimit} 
                      onChange={(e) => setChartLimit(Number(e.target.value))}
                    >
                      <option value={5}>5 items</option>
                      <option value={10}>10 items</option>
                      <option value={15}>15 items</option>
                      <option value={20}>20 items (larger chart)</option>
                    </select>
                  </div>
                </div>

                {selectedChartColumn && chartData && (
                  <div className={`chart-container ${chartLimit > 15 ? 'many-items' : ''}`}>
                    <div className={`chart-wrapper ${chartLimit > 15 ? 'many-items' : ''}`}>
                      {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
                      {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
                      {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
                    </div>
                  </div>
                )}

                {selectedChartColumn && !chartData && (
                  <div className="chart-empty">
                    <TrendingUp size={48} />
                    <p>No data available for visualization</p>
                  </div>
                )}

                {!selectedChartColumn && (
                  <div className="chart-empty">
                    <TrendingUp size={48} />
                    <p>Select a column to visualize data</p>
                  </div>
                )}
              </div>
            )}

            {/* Global Search */}
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search across all columns..."
                value={globalSearch}
                onChange={(e) => { setGlobalSearch(e.target.value); setCurrentPage(1); }}
              />
              {hasActiveFilters && (
                <button className="clear-btn" onClick={clearAllFilters}>
                  <X size={16} /> Clear All
                </button>
              )}
            </div>

            {/* Column Filters */}
            {showFilters && (
              <div className="filters-panel">
                <div className="panel-header">
                  <h3>Column Filters</h3>
                  <button className="text-btn" onClick={clearAllFilters}>Clear All</button>
                </div>
                <div className="filters-grid">
                  {visibleColumns.map(col => (
                    <div key={col} className="filter-item">
                      <label>{col}</label>
                      <input
                        type="text"
                        placeholder="Type to filter..."
                        value={columnFilters[col] || ''}
                        onChange={(e) => {
                          setColumnFilters(prev => ({ ...prev, [col]: e.target.value }));
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Column Visibility Panel */}
            {showColumnPanel && (
              <div className="column-panel">
                <div className="panel-header">
                  <h3>Manage Columns</h3>
                  <button className="text-btn" onClick={() => setShowColumnPanel(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="column-list">
                  {columns.map(col => (
                    <label key={col} className="column-item">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col)}
                        onChange={() => toggleColumnVisibility(col)}
                      />
                      <span>{col}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <button onClick={toggleSelectAll} className="checkbox-btn">
                        {selectedRows.size === filteredData.length && filteredData.length > 0 
                          ? <CheckSquare size={18} /> 
                          : <Square size={18} />
                        }
                      </button>
                    </th>
                    <th className="row-num">#</th>
                    {visibleColumns.map(col => (
                      <th key={col} onClick={() => handleSort(col)} className="sortable">
                        <div className="th-content">
                          <span>{col}</span>
                          <span className="sort-icon">
                            {sortConfig.column === col ? (
                              sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                            ) : (
                              <ChevronsUpDown size={16} />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, i) => {
                      const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
                      return (
                        <tr key={i} className={selectedRows.has(globalIndex) ? 'selected' : ''}>
                          <td className="checkbox-col">
                            <button onClick={() => toggleRowSelection(globalIndex)} className="checkbox-btn">
                              {selectedRows.has(globalIndex) 
                                ? <CheckSquare size={18} /> 
                                : <Square size={18} />
                              }
                            </button>
                          </td>
                          <td className="row-num">{globalIndex + 1}</td>
                          {visibleColumns.map(col => (
                            <td key={col}>{row[col] || ''}</td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={visibleColumns.length + 2} className="no-results">
                        <div className="empty-state">
                          <Search size={48} />
                          <h3>No results found</h3>
                          <p>Try adjusting your filters or search query</p>
                          <button className="primary-btn" onClick={clearAllFilters}>Clear Filters</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                >
                  First
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="page-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
