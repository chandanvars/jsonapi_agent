# TestRail Integration - Quick Reference

## Connection Parameters

```javascript
{
  "url": "https://yourcompany.testrail.io",      // Your TestRail instance URL
  "username": "your-email@company.com",           // Your TestRail email
  "password": "xxxxxxxxxxxxx",                    // Your API Key (not your password!)
  "projectName": "My API Project",                // Exact project name (case-sensitive)
  "suiteName": "Master Suite",                    // Optional - test suite name
  "runId": 123                                    // Test Run ID (find in TestRail URL)
}
```

## How to Find Test Run ID

1. Open your test run in TestRail
2. Look at the URL bar
3. Example URL: `https://yourcompany.testrail.io/index.php?/runs/view/123`
4. The number after `/view/` is your Run ID → `123`

## API Endpoints

### 1. Connect to TestRail
```
POST /api/testrail/connect
Content-Type: application/json

{
  "url": "https://yourcompany.testrail.io",
  "username": "your-email@company.com",
  "password": "your-api-key"
}
```

### 2. Get Test Cases from Run
```
POST /api/testrail/test-cases
Content-Type: application/json

{
  "projectName": "My Project",
  "suiteName": "Master Suite",
  "runId": 123
}
```

### 3. Execute API Test with TestRail
```
POST /api/test
Content-Type: application/json

{
  "apiUrl": "https://api.example.com/users",
  "method": "GET",
  "headers": {"Content-Type": "application/json"},
  "body": null,
  "fieldsToHighlight": {
    "request": ["url", "method"],
    "response": ["id", "name", "email"]
  },
  "excelFileName": "user-api-test",
  "appendMode": false,
  "testCaseName": "",
  "testrail": {
    "enabled": true,
    "selectedTestCases": [
      {"id": 1001, "title": "Test user API"},
      {"id": 1002, "title": "Verify response fields"}
    ]
  }
}
```

## Status Codes

TestRail uses numeric status IDs:

| Status ID | Status Name | When Used |
|-----------|-------------|-----------|
| 1 | Passed | HTTP status 200-299 |
| 2 | Blocked | Not used by this tool |
| 3 | Untested | Default status |
| 4 | Retest | Not used by this tool |
| 5 | Failed | HTTP status 300-599 |

## UI Workflow

```
┌─────────────────────────────────────────────┐
│ Step 0: TestRail Integration (Optional)    │
├─────────────────────────────────────────────┤
│ 1. Enter TestRail URL                       │
│ 2. Enter Username                           │
│ 3. Enter Password/API Token                 │
│ 4. Enter Project Name                       │
│ 5. Enter Suite Name (optional)              │
│ 6. Enter Test Run ID                        │
│ 7. Click "Connect to TestRail"              │
├─────────────────────────────────────────────┤
│ ✓ Connection Success                        │
│   → Test cases loaded with checkboxes       │
│ 8. Select test cases to update              │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 1: Configure Your API Test            │
│ (Configure as usual)                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Step 2: Select Fields to Highlight         │
│ (Configure as usual)                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Execute Test with Highlighting              │
├─────────────────────────────────────────────┤
│ → API call executed                         │
│ → Screenshots captured                      │
│ → Excel report generated                    │
│ → Screenshots uploaded to TestRail          │
│ → Test results updated                      │
└─────────────────────────────────────────────┘
```

## Test Result Format in TestRail

### Comment
```
API Test Result
Endpoint: https://api.example.com/users
Method: POST
Status: 200 OK

Timestamp: 10/30/2025, 3:45:00 PM
```

### Attachments
- `user-api-test_full_2025-10-30T15-45-00.png`
- `user-api-test_request_group1_2025-10-30T15-45-00.png`
- `user-api-test_response_group1_2025-10-30T15-45-00.png`

## Common Issues & Solutions

### "Authentication failed"
- ✅ Use API Key (not your login password)
- ✅ Generate API Key from TestRail → My Settings → API Keys

### "Project not found"
- ✅ Check exact spelling (case-sensitive)
- ✅ Ensure you have access to the project

### "Test run not found"
- ✅ Verify Test Run ID from the URL
- ✅ Ensure test run is active (not closed)

### "Permission denied"
- ✅ Check your TestRail role has permission to add results
- ✅ Verify test run is not locked

### Screenshots not uploading
- ✅ Check file size limits (depends on TestRail plan)
- ✅ Ensure screenshots were generated successfully
- ✅ Verify network connectivity

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use API Keys** instead of passwords
3. **Rotate keys** periodically (every 90 days)
4. **Limit permissions** to only required projects
5. **Use HTTPS** always (TestRail enforces this)

## Example Test Scenarios

### Scenario 1: Single Test Case
```javascript
// Connect once
// Select 1 test case: C101
// Execute API test
// Result: C101 updated with 3 screenshots
```

### Scenario 2: Multiple Test Cases
```javascript
// Connect once
// Select 5 test cases: C101, C102, C103, C104, C105
// Execute API test
// Result: All 5 tests updated with same screenshots
```

### Scenario 3: Regression Suite
```javascript
// Connect to test run "Regression Suite - Sprint 45"
// Load 50 test cases
// Select only API-related tests (10 cases)
// Execute multiple API tests
// Each execution updates the 10 selected cases
```

## Tips & Tricks

1. **Batch Updates**: Select multiple test cases to update them all at once with the same screenshots
2. **Reuse Connection**: Once connected, you can execute multiple tests without reconnecting
3. **Test Run Organization**: Create separate test runs for different features/sprints
4. **Naming Convention**: Use descriptive test case names for easy identification
5. **Regular Cleanup**: Close old test runs to keep TestRail organized

## API Rate Limits

TestRail has API rate limits:
- **Default**: 180 requests per minute
- **Enterprise**: Higher limits available

This tool makes:
- 1 request to connect
- 1 request to get projects
- 1 request to get test run
- 1 request to get tests
- N requests to add results (N = selected test cases)
- M requests to upload attachments (M = screenshots × N)

**Estimate**: For 5 test cases with 3 screenshots each = ~20 API calls

## Troubleshooting Checklist

- [ ] TestRail URL is correct (https://yourcompany.testrail.io)
- [ ] Username is your email address
- [ ] Using API Key (not password)
- [ ] Project name is exact match (case-sensitive)
- [ ] Test Run ID is correct
- [ ] Test run is active (not closed)
- [ ] You have "Add Results" permission
- [ ] Network connectivity is working
- [ ] Firewall allows TestRail API access

## Support & Resources

- 📖 [Full Integration Guide](TESTRAIL_INTEGRATION.md)
- 📚 [TestRail API Documentation](https://www.gurock.com/testrail/docs/api)
- 🔧 [TestRail API Reference](https://www.gurock.com/testrail/docs/api/reference)

---

**Last Updated**: October 30, 2025  
**Version**: 1.1.0
