# API Testing Agent

A powerful Node.js application that executes API calls, highlights specified fields in request/response data, captures focused screenshots, and generates Excel reports with embedded images.

## 🌟 Features

- 🚀 **API Execution**: Make HTTP requests to any REST API (GET, POST, PUT, DELETE, PATCH)
- 🎯 **Smart Field Highlighting**: Highlight specific fields in JSON request/response data
- 📸 **Intelligent Screenshots**: Automatically captures focused screenshots of highlighted fields with context
- 📊 **Excel Reports**: Generate comprehensive Excel files with side-by-side request/response screenshots
- 🌐 **Web Interface**: Beautiful, user-friendly web UI with smart field suggestions
- 🎨 **Visual HTML**: Creates clean HTML visualizations with proper formatting
- 🔄 **Auto Cleanup**: Automatically closes browser after test completion
- 📑 **Multi-Test Support**: Append multiple test cases to the same Excel file with named tabs
- ⚡ **Auto-Clear Messages**: Success messages automatically clear after 10 seconds
- 🎯 **Side-by-Side Layout**: Request and response screenshots displayed adjacently in Excel
- 🔗 **TestRail Integration**: Connect to TestRail and automatically upload screenshots to test results

## 🔗 NEW: TestRail Integration

Seamlessly integrate with TestRail to update test results with screenshots:

**How it works:**
1. **Connect**: Enter your TestRail URL, credentials, project name, and test run ID
2. **Load Tests**: Automatically fetch all test cases from the specified test run
3. **Select Tests**: Choose which test cases to update using checkboxes
4. **Execute**: Run your API test as normal
5. **Auto-Upload**: Screenshots are automatically uploaded to selected test cases with detailed comments

**Features:**
- ✅ Automatic status updates (Passed/Failed based on HTTP response)
- 📎 All screenshots attached to test results
- 📝 Detailed comments with API endpoint, method, status, and timestamp
- 🎯 Support for multiple test case selection
- 🔒 Secure connection using TestRail API tokens

📖 **[Complete TestRail Integration Guide →](TESTRAIL_INTEGRATION.md)**

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
   - **Report File Name**: Enter a base name for your report (default: `interactive-api-test`)

3. **Append Mode (Optional)**
   - Check "Append to existing Excel file" to add multiple test cases to one file
   - When checked, enter a **Test Case Name** (e.g., `Login_Test`, `Get_Users`)
   - Each test case will be added as a separate tab in the same Excel file
   - When unchecked, a new timestamped Excel file is created for each test

4. **Execute Test**
   - Click "Execute Test with Highlighting"
   - Browser opens automatically
   - Screenshots captured with highlighted fields
   - Excel report generated with side-by-side layout
   - Browser closes automatically
   - Success message displays and auto-clears after 10 seconds

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

**Single Test Mode (Append unchecked):**
```
reports/
└── test-name_2025-10-29T08-14-46-361Z.xlsx
    └── API Test Details (single sheet)
        ├── API URL
        ├── HTTP Method
        ├── Request/Response Headers
        ├── Request/Response Data
        └── Screenshots (Side-by-Side)
            ├── 📤 REQUEST DETAILS (Column A)
            └── 📥 RESPONSE DETAILS (Column B)
```

**Multi-Test Mode (Append checked):**
```
reports/
└── test-name.xlsx (no timestamp)
    ├── Login_Test (tab)
    │   └── [API details + side-by-side screenshots]
    ├── Get_Users (tab)
    │   └── [API details + side-by-side screenshots]
    └── Create_Order (tab)
        └── [API details + side-by-side screenshots]
```

## 🎯 Advanced Features

### Smart Field Grouping
- Fields within 200px are automatically grouped into single screenshots
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

### Side-by-Side Screenshot Layout
- Request screenshots displayed in left column (📤 REQUEST DETAILS)
- Response screenshots displayed in right column (📥 RESPONSE DETAILS)
- Both screenshots aligned at the same row for easy comparison
- Images scaled to 40% for optimal Excel display
- Color-coded headers: Orange for requests, Green for responses

### Multi-Test Case Management
- **Append Mode OFF**: Creates new Excel file with timestamp for each test
- **Append Mode ON**: Adds new tab to existing Excel file
- Each tab named by test case (e.g., `Login_Scenario`, `Get_User_Data`)
- Automatic tab name conflict resolution (adds counter if duplicate)
- Perfect for organizing regression test results

### Auto-Clear UI Messages
- Success messages automatically disappear after 10 seconds
- Error messages clear when you click "Execute Test" again
- Keeps UI clean and uncluttered

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

5. **Using Append Mode Effectively**
   - Use the same "Report File Name" for related tests
   - Give each test case a descriptive name (e.g., `Login_Success`, `Login_Invalid`)
   - Perfect for organizing test suites in one Excel file
   - Each tab will show side-by-side request/response comparison

6. **Test Case Naming Convention**
   - Use underscores instead of spaces: `Create_User` not `Create User`
   - Keep names short (max 31 characters - Excel limitation)
   - Be descriptive: `API_Get_Users_200` better than `Test1`

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
  "excelFileName": "user-creation-test",
  "appendMode": false,
  "testCaseName": ""
}
```

**For Multi-Test Mode:**
```javascript
POST http://localhost:3000/api/test

{
  "apiUrl": "https://api.example.com/users",
  "method": "GET",
  "headers": { "Content-Type": "application/json" },
  "body": null,
  "fieldsToHighlight": {
    "request": ["url", "method"],
    "response": ["id", "name", "email"]
  },
  "excelFileName": "regression-tests",
  "appendMode": true,
  "testCaseName": "Get_All_Users"
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

## 🆕 What's New in Version 2.0.0

### Side-by-Side Screenshot Layout
- Request and response screenshots now displayed adjacently in Excel
- No more separate "Screenshots" tab - everything in one view
- Color-coded headers for easy identification

### Multi-Test Case Support
- Append mode allows multiple test cases in one Excel file
- Each test case gets its own named tab
- Perfect for organizing regression test suites

### Enhanced UI Experience
- Auto-clear success messages after 10 seconds
- Messages clear automatically when starting a new test
- Cleaner, more professional interface

### Improved Excel Reports
- Single consolidated worksheet per test
- Side-by-side layout for easy comparison
- Optimized image scaling (40%) for better Excel performance

---

**Version:** 2.0.0  
**Last Updated:** October 30, 2025  
**Author:** Chandan Varshney