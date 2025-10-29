# API Testing Agent

A powerful Node.js application that executes API calls, highlights specified fields in request/response data, captures focused screenshots, and generates Excel reports with embedded images.

## 🌟 Features

- 🚀 **API Execution**: Make HTTP requests to any REST API (GET, POST, PUT, DELETE, PATCH)
- 🎯 **Smart Field Highlighting**: Highlight specific fields in JSON request/response data
- 📸 **Intelligent Screenshots**: Automatically captures focused screenshots of highlighted fields with context
- 📊 **Excel Reports**: Generate comprehensive Excel files with embedded high-quality screenshots
- 🌐 **Web Interface**: Beautiful, user-friendly web UI with smart field suggestions
- 🎨 **Visual HTML**: Creates clean HTML visualizations with proper formatting
- 🔄 **Auto Cleanup**: Automatically closes browser after test completion

## 📋 Prerequisites

Before installing, ensure you have:

- **Node.js** (v14 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Windows/Mac/Linux** - Works on all platforms

## 🚀 Quick Start (For Team Members)

### Step 1: Extract the Package
```bash
# Extract the zip file to your desired location
# Example: C:\Tools\ukg_agent or ~/Tools/ukg_agent
```

### Step 2: Install Dependencies
```bash
# Navigate to the project folder
cd ukg_agent

# Install all required packages (one-time setup)
npm install
```

### Step 3: Start the Tool
```bash
# Start the server
npm start
```

### Step 4: Open in Browser
```
Open your web browser and go to:
http://localhost:3000
```

That's it! The tool is now ready to use. 🎉

## 📖 Detailed Usage Guide

### Using the Web Interface (Recommended)

1. **Configure API Test**
   - Enter API URL (e.g., `https://api.example.com/users`)
   - Select HTTP Method (GET, POST, PUT, DELETE, PATCH)
   - Add headers in JSON format
   - Add request body for POST/PUT/PATCH

2. **Select Fields to Highlight**
   - Click "Configure Field Highlighting"
   - **Request Fields**: Auto-suggested (e.g., `url, method, id, name`)
   - **Response Fields**: Enter manually based on your API (e.g., `userId, id, title`)

3. **Execute Test**
   - Click "Execute Test with Highlighting"
   - Browser opens automatically
   - Screenshots captured with highlighted fields
   - Excel report generated
   - Browser closes automatically

4. **View Results**
   - Screenshots saved in `screenshots/` folder
   - Excel report saved in `reports/` folder
   - Open Excel file to see all captured screenshots

### Example: Testing JSONPlaceholder API

**Configuration:**
```
URL: https://jsonplaceholder.typicode.com/posts/1
Method: GET
Headers: {"Content-Type": "application/json"}

Request Fields: url, method
Response Fields: userId, id, title, body
```

**Result:** Excel report with highlighted fields and crystal-clear screenshots!

## 📁 Generated Files

### Screenshots Folder Structure
```
screenshots/
├── test-name_full_2025-10-29T08-14-46-361Z.png      # Full page overview
├── test-name_request_group1_2025-10-29T08-14-46-361Z.png   # Request fields
└── test-name_response_group1_2025-10-29T08-14-46-361Z.png  # Response fields
```

### Excel Report Structure
```
reports/
└── test-name_2025-10-29T08-14-46-361Z.xlsx
    ├── API Test Details (sheet)
    │   ├── API URL
    │   ├── HTTP Method
    │   ├── Request/Response Headers
    │   └── Request/Response Data
    └── Screenshots (sheet)
        ├── Full Page Screenshot
        ├── Request Fields - Group 1
        └── Response Fields - Group 1
```

## 🎯 Advanced Features

### Smart Field Grouping
- Fields within 100px are automatically grouped into single screenshots
- Reduces number of screenshots while maintaining clarity
- Shows surrounding context for better understanding

### Field Highlighting Logic
- Highlights exact field and its value only
- Supports strings, numbers, booleans, null values
- Supports simple arrays
- Does NOT highlight entire nested objects (precise matching)

### Fallback Screenshots
- If no fields are highlighted (field names don't match), captures full section
- Ensures you always get screenshots even if field names are incorrect

## 🛠️ Configuration

### Browser Settings
The tool uses Puppeteer with the following settings:
- Viewport: 1920x1080 (Full HD)
- Device Scale: 1x (100% zoom, no artificial scaling)
- Browser closes automatically after test completion

### Screenshot Settings
- Format: PNG (high quality)
- Full page: 900x700 (scaled for Excel)
- Field groups: 800x300 (focused with context)
- Padding: 100px around highlighted fields

## 📝 Tips for Best Results

1. **Field Names Must Match Exactly**
   - Use exact field names from your API response
   - Case-sensitive matching
   - Example: `userId` not `userid` or `UserId`

2. **Test Your API First**
   - Know your API response structure before configuring
   - Use tools like Postman to inspect response fields

3. **Response Fields**
   - Always enter response fields manually
   - Tool only suggests request fields
   - Look at your API documentation for correct field names

4. **For Large Responses**
   - Only highlight important fields (3-5 recommended)
   - Too many fields create multiple screenshots

## 🔧 Troubleshooting

### Browser Not Closing
- Fixed in latest version - browser closes automatically
- If issue persists, restart the server with `npm start`

### Screenshot Text Too Small
- Fixed - using optimal font sizes (14px content, 16px highlights)
- Screenshots captured at native resolution without zoom

### Fields Not Highlighted
- Check field names match API response exactly
- Fields are case-sensitive
- Tool will capture full section if no matches found

### Excel File Won't Open
- Ensure Excel file is not already open
- Check `reports/` folder for latest file
- Look for timestamp in filename

## 🖥️ Command Line Usage (Alternative)

### Using the API Endpoint
```javascript
POST http://localhost:3000/api/test

{
  "apiUrl": "https://api.example.com/data",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token",
    "Content-Type": "application/json"
  },
  "body": {
    "username": "testuser",
    "email": "test@example.com"
  },
  "fieldsToHighlight": {
    "request": ["username", "email"],
    "response": ["id", "status", "message"]
  },
  "excelFileName": "user-creation-test"
}
```

### Using Programmatically
```javascript
const APITestingAgent = require('./src/apiTestingAgent');
const agent = new APITestingAgent();

const result = await agent.executeAPITest({
    apiUrl: 'https://api.example.com/users',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: null,
    fieldsToHighlight: {
        request: ['url', 'method'],
        response: ['id', 'name', 'email']
    },
    excelFileName: 'get-users-test'
});

await agent.cleanup(); // Don't forget to close browser
```

## 📦 Package Contents

```
ukg_agent/
├── src/
│   ├── index.js              # Express server
│   └── apiTestingAgent.js    # Core agent logic
├── public/
│   └── index.html           # Web interface
├── screenshots/              # Generated screenshots
├── reports/                  # Generated Excel files
├── example.js               # Example usage
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔒 Security Notes

- Tool runs locally on your machine
- No data sent to external servers
- API credentials stay on your machine
- Generated files stored locally only

## 🤝 Support & Feedback

For issues or questions:
1. Check this README first
2. Review console logs for error messages
3. Check `screenshots/` and `reports/` folders for output
4. Contact: Chandan Varshney

## 📄 License

MIT License - Free to use and modify

---

**Version:** 1.0.0  
**Last Updated:** October 29, 2025  
**Author:** Chandan Varshney