# CSV Master - Professional Data Viewer

A modern, feature-rich CSV viewer and analyzer built with React. Upload, filter, sort, and analyze your CSV data with an intuitive interface.

## ✨ Features

### 📤 File Upload
- **Drag & Drop** - Simply drag your CSV file into the upload zone
- **File Browser** - Click to browse and select files
- **Validation** - Automatic CSV file validation
- **Large File Support** - Handles large datasets efficiently

### 📊 Visual Analytics (NEW!)
- **Bar Charts** - Compare values across categories
- **Pie Charts** - Show proportions and percentages
- **Line Charts** - Display trends and patterns
- **Column Selection** - Analyze any column from your CSV
- **Top N Items** - Show 5, 10, 15, or 20 most frequent values
- **Adaptive Sizing** - Charts automatically adjust for many items
- **Rotated Labels** - Clear labels even with 20 items
- **Filter Integration** - Charts respect applied filters
- **Theme-Aware** - Adapts to light/dark theme
- **Interactive** - Hover for details with percentages, responsive design

### 🔍 Search & Filter
- **Global Search** - Search across all columns simultaneously
- **Column Filters** - Individual filter input for each column
- **Real-time Filtering** - Instant results as you type
- **Clear All** - Reset all filters with one click

### 📊 Data Management
- **Smart Sorting** - Click column headers to sort (numeric/alphabetic)
- **Pagination** - Navigate through data with 10 rows per page
- **Horizontal Scroll** - Scroll horizontally for wide tables
- **Row Selection** - Select individual rows or all at once
- **Bulk Delete** - Delete multiple selected rows
- **Column Visibility** - Show/hide columns dynamically

### 💾 Export
- **CSV Export** - Export filtered data to CSV
- **Preserves Filters** - Only exports visible, filtered data
- **Proper Formatting** - Handles commas and special characters

### 🎨 UI/UX
- **Light/Dark Theme** - Toggle between themes
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Polished transitions and effects
- **Clean Interface** - Modern, professional design
- **Stats Dashboard** - View total, filtered, and selected counts

### ⚡ Performance
- **Efficient Parsing** - Uses PapaParse for fast CSV processing
- **Optimized Rendering** - Only renders visible rows (10 per page)
- **Memoized Calculations** - Prevents unnecessary re-renders
- **Horizontal Scroll** - Smooth scrolling for wide tables

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "d:\project - zift\ConsystemsAI task\project1"
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## 📖 How to Use

### 1. Upload CSV File
- Drag and drop a CSV file onto the upload zone, OR
- Click "Choose File" to browse and select a file
- A sample CSV file (`sample-data.csv`) is included for testing

### 2. View Data
- Data automatically loads into the table
- View stats: Total rows, Filtered rows, Columns, Selected rows

### 3. Search & Filter
- **Global Search**: Type in the search bar to search all columns
- **Column Filters**: Click "Show Filters" and enter text in specific column filters
- **Clear Filters**: Click "Clear All" to reset all filters

### 4. Sort Data
- Click any column header to sort ascending
- Click again to sort descending
- Click a third time to remove sorting

### 5. Select Rows
- Click checkbox in row to select individual rows
- Click checkbox in header to select/deselect all rows
- Selected count shows in stats bar

### 6. Manage Columns
- Click the eye icon (👁️) in the header
- Check/uncheck columns to show/hide them
- Hidden columns are excluded from export

### 7. Delete Rows
- Select one or more rows
- Click "Delete (X)" button
- Rows are removed from the dataset

### 8. Export Data
- Click the download icon (⬇️) in the header
- Exports currently filtered and visible data
- Downloads as CSV file

### 9. Toggle Theme
- Click the sun/moon icon in the header
- Switches between light and dark themes
- Theme preference is visual only (not persisted)

### 10. Visual Analytics (NEW!)
- Click the chart icon (📈) in the header
- Select a column to visualize
- Choose chart type: Bar, Pie, or Line
- Adjust "Show Top" to display 5-20 items
- Charts update with filters automatically
- Close charts panel when done

### 11. Upload New File
- Click "Upload New" to reset and upload a different file
- All filters and selections are cleared

## 🎯 Keyboard Shortcuts

Currently, all actions are accessible via mouse/touch. Keyboard shortcuts can be added in future versions.

## 📁 Project Structure

```
project1/
├── public/
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Application styles
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── sample-data.csv     # Sample CSV for testing
├── package.json        # Dependencies
└── README.md          # This file
```

## 🛠️ Technologies Used

- **React 19.2.5** - UI framework
- **PapaParse 5.5.3** - CSV parsing library
- **Chart.js** - Professional charting library
- **React-ChartJS-2** - React wrapper for Chart.js
- **Lucide React 1.14.0** - Icon library
- **CSS3** - Styling with CSS variables for theming

## 📊 Sample Data

A sample CSV file (`sample-data.csv`) is included with employee data:
- Name, Email, Age, Department, Salary, Status
- 15 sample records
- Perfect for testing all features

## 🐛 Troubleshooting

### CSV not loading?
- Ensure file has `.csv` extension
- Check that file has headers in the first row
- Verify file is not corrupted

### Filters not working?
- Make sure you've entered text in the filter inputs
- Check that the column contains matching data
- Try clearing all filters and starting fresh

### Export not working?
- Ensure you have data loaded
- Check browser's download settings
- Try a different browser if issues persist

## 🔮 Future Enhancements

Potential features for future versions:
- ✅ Data visualization (charts/graphs) - **NOW AVAILABLE!**
- Advanced filtering (date ranges, numeric ranges)
- Column reordering
- Custom column formatting
- Data validation rules
- Import from multiple sources
- Save/load filter presets
- Keyboard shortcuts
- Print functionality
- Data aggregation (sum, average, count)

## 📝 License

This project is for educational and demonstration purposes.

## 👨‍💻 Author

Created as part of ConsystemsAI task

## 🙏 Acknowledgments

- PapaParse for excellent CSV parsing
- Chart.js for powerful data visualization
- Lucide for beautiful icons
- React team for the amazing framework
