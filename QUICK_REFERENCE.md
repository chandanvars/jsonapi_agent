# 🚀 API Testing Agent - Quick Reference

## ⚡ Quick Start
```bash
npm install        # One-time setup
npm start          # Start tool
# Open: http://localhost:3000
```

## 📝 Common Commands
| Command | Purpose |
|---------|---------|
| `npm start` | Start the server |
| `npm test` | Run example test |
| `Ctrl+C` | Stop the server |
| `npm install` | Reinstall dependencies |

## 🎯 Using the Web Interface

### Step 1: API Configuration
```
URL:     https://api.example.com/endpoint
Method:  GET/POST/PUT/DELETE/PATCH
Headers: {"Authorization": "Bearer token"}
Body:    {"key": "value"} (for POST/PUT/PATCH)
```

### Step 2: Field Highlighting
```
Request Fields:  Auto-suggested → Review
Response Fields: Enter manually → userId, id, name, status
```

### Step 3: Execute & View
```
Click "Execute Test" → Wait for completion → Check reports/ folder
```

## 📂 Output Locations
| Type | Location |
|------|----------|
| Excel Reports | `reports/` |
| Screenshots | `screenshots/` |
| Logs | Terminal/Console |

## 🔧 Common Scenarios

### Testing GET API
```
URL: https://api.example.com/users/123
Method: GET
Headers: {"Content-Type": "application/json"}
Response Fields: id, name, email, status
```

### Testing POST API
```
URL: https://api.example.com/users
Method: POST
Headers: {"Authorization": "Bearer TOKEN", "Content-Type": "application/json"}
Body: {"username": "john", "email": "john@example.com"}
Request Fields: username, email (auto-suggested)
Response Fields: id, status, message
```

### Testing with Authentication
```
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "Content-Type": "application/json"
}
```

## ⚠️ Troubleshooting Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Port already in use | Stop other app or change port in `src/index.js` |
| npm command not found | Install Node.js from nodejs.org |
| Browser won't close | Press Ctrl+C and restart |
| Fields not highlighted | Check exact field names (case-sensitive) |
| Can't find Excel report | Check `reports/` folder, sort by date |

## 💡 Pro Tips
- ✅ Only highlight 3-5 important fields
- ✅ Use exact field names from API (case-sensitive)
- ✅ Name files descriptively: `user-creation-test` not `test1`
- ✅ Check API in Postman first to know field names
- ✅ Response fields must be entered manually

## 📊 Excel Report Contains
- ✅ API URL and method
- ✅ Request/Response headers
- ✅ Request/Response body
- ✅ Full page screenshot
- ✅ Highlighted field screenshots
- ✅ Timestamp and status code

## 🎓 Example APIs for Testing
```
JSONPlaceholder (Public API):
- GET:  https://jsonplaceholder.typicode.com/posts/1
- POST: https://jsonplaceholder.typicode.com/posts

ReqRes (Public API):
- GET:  https://reqres.in/api/users/2
- POST: https://reqres.in/api/users
```

## 📞 Support
- 📖 Detailed guide: `SETUP_GUIDE.md`
- 📚 Technical docs: `README.md`
- 💬 Contact: Chandan Varshney

## 🔗 Quick Links
| Resource | Purpose |
|----------|---------|
| http://localhost:3000 | Web Interface |
| http://localhost:3000/health | Health Check |
| reports/ | Excel Reports |
| screenshots/ | PNG Screenshots |

---

**Version 1.0.0** | Last Updated: October 29, 2025
