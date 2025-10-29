# 📦 API Testing Agent - Setup Guide for Teams

## 🎯 What is this tool?

The API Testing Agent is a powerful tool that:
- ✅ Executes API calls to any REST endpoint
- ✅ Highlights specific fields you care about in requests and responses
- ✅ Takes high-quality screenshots with context
- ✅ Generates professional Excel reports with embedded images

Perfect for: API testing, documentation, bug reports, and team collaboration!

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js installed** (version 14 or higher)
  - Check: Open terminal/command prompt and type: `node --version`
  - If not installed: Download from [https://nodejs.org/](https://nodejs.org/)
  - Download the **LTS version** (recommended)

- [ ] **npm installed** (comes with Node.js)
  - Check: Type `npm --version` in terminal
  
- [ ] **Internet connection** (for first-time setup to download packages)

---

## 🚀 Installation Steps

### Step 1: Extract the Package
1. Download the `ukg_agent.zip` file
2. Extract to a location on your computer:
   - **Windows**: `C:\Tools\ukg_agent` or `C:\Users\YourName\ukg_agent`
   - **Mac/Linux**: `~/Tools/ukg_agent` or `~/ukg_agent`

### Step 2: Open Terminal/Command Prompt
- **Windows**: 
  - Press `Win + R`, type `cmd`, press Enter
  - OR right-click in the folder and select "Open in Terminal"
- **Mac**: 
  - Press `Cmd + Space`, type "Terminal", press Enter
- **Linux**: 
  - Press `Ctrl + Alt + T`

### Step 3: Navigate to Project Folder
```bash
# Windows example:
cd C:\Tools\ukg_agent

# Mac/Linux example:
cd ~/Tools/ukg_agent
```

### Step 4: Install Dependencies (One-Time Setup)
```bash
npm install
```

**What this does:**
- Downloads all required packages (Puppeteer, ExcelJS, Express, etc.)
- Takes 2-5 minutes depending on internet speed
- Shows progress bars and completion messages
- Creates a `node_modules` folder (don't delete this!)

**Expected output:**
```
added 234 packages, and audited 235 packages in 2m
found 0 vulnerabilities
```

### Step 5: Start the Tool
```bash
npm start
```

**Expected output:**
```
> ukg_agent@1.0.0 start
> node src/index.js

🚀 API Testing Agent Server running on http://localhost:3000
📊 Health check available at http://localhost:3000/health
```

### Step 6: Open in Browser
1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Navigate to: `http://localhost:3000`
3. You should see the API Testing Agent interface! 🎉

---

## 🎬 Quick Demo (5 Minutes)

### Test with a Public API

**Try this example:**

1. **API Configuration**
   - URL: `https://jsonplaceholder.typicode.com/posts/1`
   - Method: `GET`
   - Headers: `{"Content-Type": "application/json"}`
   - Body: Leave empty

2. **Click "Configure Field Highlighting"**

3. **Field Selection**
   - Request Fields: `url, method` (auto-suggested)
   - Response Fields: `userId, id, title, body` (enter manually)

4. **Click "Execute Test with Highlighting"**

5. **Watch the Magic!**
   - Browser opens automatically
   - Fields get highlighted in yellow
   - Screenshots captured
   - Excel report generated
   - Browser closes automatically

6. **Check Results**
   - Look in `reports/` folder for Excel file
   - Open the Excel file to see screenshots
   - Screenshots also saved in `screenshots/` folder

---

## 📖 How to Use (Step-by-Step)

### For GET Requests (Fetching Data)

```
Step 1: Enter API URL
Example: https://api.example.com/users/123

Step 2: Select Method: GET

Step 3: Add Headers (if required)
Example: {"Authorization": "Bearer YOUR_TOKEN"}

Step 4: Click "Configure Field Highlighting"

Step 5: Request fields auto-suggested → Review and adjust

Step 6: Enter Response fields manually
Example: id, name, email, status

Step 7: Click "Execute Test with Highlighting"

Step 8: View Excel report in reports/ folder
```

### For POST Requests (Creating/Updating Data)

```
Step 1: Enter API URL
Example: https://api.example.com/users

Step 2: Select Method: POST

Step 3: Add Headers
Example: {"Authorization": "Bearer TOKEN", "Content-Type": "application/json"}

Step 4: Add Request Body
Example: {"username": "john", "email": "john@example.com"}

Step 5: Click "Configure Field Highlighting"

Step 6: Request fields auto-suggested (url, method, username, email)

Step 7: Enter Response fields manually
Example: id, status, message

Step 8: Click "Execute Test with Highlighting"

Step 9: View Excel report with request and response screenshots
```

---

## 📁 Understanding Output Files

### Screenshots Folder (`screenshots/`)
```
screenshots/
├── my-test_full_2025-10-29T10-30-45.png          ← Full page view
├── my-test_request_group1_2025-10-29T10-30-45.png ← Request fields
└── my-test_response_group1_2025-10-29T10-30-45.png ← Response fields
```

### Reports Folder (`reports/`)
```
reports/
└── my-test_2025-10-29T10-30-45.xlsx
```

**Excel file contains:**
- **Sheet 1: API Test Details**
  - API URL, Method
  - Request headers, body
  - Response headers, body
  - Status code, timing
  
- **Sheet 2: Screenshots**
  - Full page screenshot
  - Request field screenshots
  - Response field screenshots

---

## ⚠️ Troubleshooting

### Problem: "npm: command not found"
**Solution:** Node.js is not installed or not in PATH
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart terminal after installation
3. Verify: `node --version`

### Problem: "Port 3000 is already in use"
**Solution:** Another application is using port 3000
```bash
# Stop the current process:
# Windows: Press Ctrl+C in the terminal
# Mac/Linux: Press Ctrl+C in the terminal

# Or change the port in src/index.js:
const PORT = 3001; // Change to 3001 or any available port
```

### Problem: Browser doesn't close automatically
**Solution:** Already fixed in latest version
- If issue persists: Press Ctrl+C and restart with `npm start`

### Problem: Fields not highlighted in screenshots
**Solution:** Field names must match exactly
1. Check your API response in browser or Postman
2. Use exact field names (case-sensitive)
3. Example: `userId` not `userid` or `UserId`

### Problem: Excel file won't open
**Solution:** File might be locked
1. Close Excel if already open
2. Check `reports/` folder for latest file
3. Look for the timestamp in filename

### Problem: "Error: Failed to launch browser"
**Solution:** Puppeteer needs to download Chromium
```bash
# Run this command:
npm install puppeteer --force
```

---

## 🔒 Security & Privacy

✅ **Runs completely locally** - No data sent to external servers
✅ **Your API credentials stay on your machine**
✅ **Generated files stored locally only**
✅ **No telemetry or tracking**

**Important Security Notes:**
- Don't share Excel reports containing sensitive tokens/passwords
- Don't commit `reports/` or `screenshots/` folders to Git
- Use environment variables for sensitive credentials

---

## 💡 Pro Tips

### Tip 1: Field Selection
- Only highlight 3-5 important fields
- Too many fields = too many screenshots
- Focus on fields relevant to your test case

### Tip 2: Naming Convention
- Use descriptive Excel file names
- Example: `user-creation-api-test` instead of `test1`
- Easier to find later in reports folder

### Tip 3: Response Fields
- Always check API documentation first
- Use exact field names from API response
- Tool can't guess your API's field names

### Tip 4: Reusing Tests
- Save your API configurations in a document
- Reuse field lists for similar APIs
- Build a library of common test configurations

### Tip 5: Sharing Results
- Excel reports are perfect for bug reports
- Screenshots show exactly what the API returned
- Include in Jira/Azure DevOps attachments

---

## 🔄 Stopping the Tool

When finished testing:
```bash
# In the terminal where npm start is running:
Press Ctrl + C

# Confirm: Y (if prompted)
```

The tool is now stopped. To use again, run `npm start`.

---

## 📞 Getting Help

If you encounter issues:

1. **Check this guide** - Most common issues covered above
2. **Check console logs** - Terminal shows error messages
3. **Check folders** - Look in `screenshots/` and `reports/`
4. **Contact:** Chandan Varshney (tool creator)

---

## 🎓 Training Resources

### Video Tutorial (Coming Soon)
- [ ] Installation walkthrough
- [ ] First API test demo
- [ ] Advanced features

### Sample Test Cases
Check `example.js` for programmatic usage examples.

---

## 📈 Version History

**v1.0.0** (October 29, 2025)
- Initial release
- Web interface
- Smart field highlighting
- Intelligent screenshot grouping
- Excel report generation
- Auto browser cleanup

---

## ✅ Quick Checklist for First-Time Users

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Project folder extracted
- [ ] Terminal/Command Prompt opened
- [ ] Navigated to project folder (`cd path/to/ukg_agent`)
- [ ] Dependencies installed (`npm install`)
- [ ] Tool started (`npm start`)
- [ ] Browser opened to `http://localhost:3000`
- [ ] Test API executed successfully
- [ ] Excel report generated in `reports/` folder

**All checked?** You're ready to use the tool! 🚀

---

## 📄 Additional Resources

- **README.md** - Detailed technical documentation
- **example.js** - Code examples for programmatic use
- **package.json** - List of dependencies

---

**Questions?** Don't hesitate to reach out!

**Happy Testing! 🎉**
