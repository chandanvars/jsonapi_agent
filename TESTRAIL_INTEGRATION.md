# TestRail Integration Guide

## Overview

The API Testing Agent now includes seamless TestRail integration that allows you to:
- Connect to your TestRail instance
- Load test cases from specific test runs
- Select which tests to update
- Automatically upload screenshots as attachments to test results

## Features

✅ **Easy Connection**: Connect using your TestRail URL, username, and API token  
✅ **Test Run Discovery**: Automatically fetch all test cases from a specified test run  
✅ **Selective Updates**: Choose which test cases to update using checkboxes  
✅ **Automatic Status**: Test results are marked as Passed (200-299 status) or Failed (other statuses)  
✅ **Screenshot Attachments**: All generated screenshots are uploaded to selected test cases  
✅ **Detailed Comments**: Each result includes API endpoint, method, status, and timestamp  

## Getting Started

### Prerequisites

1. **TestRail Account**: You need access to a TestRail instance
2. **API Key**: Generate an API key from your TestRail account settings
3. **Test Run**: Create or identify an existing test run to update

### How to Generate TestRail API Key

1. Log in to your TestRail instance
2. Click on your profile picture (top right)
3. Select **My Settings**
4. Navigate to **API Keys** tab
5. Click **Add Key**
6. Copy the generated API key (this is your password for the integration)

## Step-by-Step Usage

### Step 1: Configure TestRail Connection

In the UI, you'll see a new **Step 0: TestRail Integration (Optional)** section with the following fields:

| Field | Description | Example | Required |
|-------|-------------|---------|----------|
| **TestRail URL** | Your TestRail instance URL | `https://yourcompany.testrail.io` | Yes |
| **Username** | Your TestRail email address | `your-email@company.com` | Yes |
| **Password / API Token** | Your TestRail password or API key | `xxxxxxxxxxxxx` | Yes |
| **Project Name** | Name of your TestRail project | `My API Project` | Yes |
| **Suite Name** | Test suite name (optional) | `Master Suite` | No |
| **Test Run ID** | ID of the test run to update | `123` | Yes |

**How to find Test Run ID:**
1. Open your test run in TestRail
2. Look at the URL: `https://yourcompany.testrail.io/index.php?/runs/view/123`
3. The number after `/view/` is your Test Run ID (e.g., `123`)

### Step 2: Connect to TestRail

1. Fill in all required fields in the TestRail section
2. Click **🔗 Connect to TestRail** button
3. Wait for the connection to establish
4. Upon success, you'll see:
   - A success message with the number of test cases found
   - A list of all test cases in the run with checkboxes

### Step 3: Select Test Cases

1. Review the list of available test cases
2. Check the boxes next to the test cases you want to update
3. You can select one or multiple test cases
4. Selected test cases will receive the screenshots after API execution

### Step 4: Execute Your API Test

1. Configure your API test as usual (Steps 1-2)
2. Execute the test
3. The system will:
   - Run the API test
   - Generate screenshots with field highlighting
   - Create Excel report
   - Upload screenshots to selected TestRail test cases
   - Add a detailed comment with test results

### Step 5: Review Results

After execution, you'll see:
- **Standard Results**: API status, screenshots, Excel report
- **TestRail Upload Results**: 
  - Success/failure count
  - Details for each test case update
  - Number of screenshots uploaded per test

## TestRail Test Result Details

When screenshots are uploaded to TestRail, each test receives:

### Status
- **Passed** (Status ID: 1) - API returned 2xx status code
- **Failed** (Status ID: 5) - API returned any other status code

### Comment Format
```
API Test Result
Endpoint: https://api.example.com/users
Method: POST
Status: 200 OK

Timestamp: 10/30/2025, 3:45:00 PM
```

### Attachments
All generated screenshots are attached:
- Full page screenshot
- Request field highlights
- Response field highlights

## API Endpoints

The integration adds two new API endpoints:

### 1. Connect to TestRail
**POST** `/api/testrail/connect`

**Request Body:**
```json
{
  "url": "https://yourcompany.testrail.io",
  "username": "your-email@company.com",
  "password": "your-api-key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected to TestRail successfully",
  "projects": [
    { "id": 1, "name": "Project 1" },
    { "id": 2, "name": "Project 2" }
  ]
}
```

### 2. Get Test Cases from Run
**POST** `/api/testrail/test-cases`

**Request Body:**
```json
{
  "projectName": "My Project",
  "suiteName": "Master Suite",
  "runId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test cases retrieved successfully",
  "testCases": [
    {
      "id": 1001,
      "caseId": 45,
      "title": "Test user login with valid credentials",
      "statusId": 3,
      "assignedTo": null,
      "refs": null
    }
  ],
  "runDetails": {
    "id": 123,
    "name": "API Test Run",
    "projectId": 1
  }
}
```

## Example Workflow

### Scenario: Testing User Registration API

1. **Setup TestRail**
   - Create a test run: "User Registration Tests"
   - Note the Run ID: `456`
   - Test cases in run:
     - C101: Register with valid email
     - C102: Register with duplicate email
     - C103: Register with missing fields

2. **Connect in UI**
   - TestRail URL: `https://mycompany.testrail.io`
   - Username: `tester@mycompany.com`
   - Password: `[API Key]`
   - Project Name: `User Management`
   - Test Run ID: `456`
   - Click **Connect to TestRail**

3. **Select Tests**
   - ✅ C101: Register with valid email
   - ✅ C102: Register with duplicate email
   - ⬜ C103: Register with missing fields (skip this one)

4. **Configure API Test**
   - API URL: `https://api.myapp.com/register`
   - Method: `POST`
   - Headers: `{"Content-Type": "application/json"}`
   - Body: `{"email": "test@example.com", "password": "Test123!"}`
   - Request Fields: `email, password`
   - Response Fields: `id, message, success`

5. **Execute Test**
   - Click **🚀 Execute Test with Highlighting**
   - Wait for completion

6. **View Results**
   - ✅ Test C101: Passed - 3 screenshots uploaded
   - ✅ Test C102: Passed - 3 screenshots uploaded
   - Screenshots attached to both test results in TestRail
   - Each test has detailed comment with API details

## Troubleshooting

### Connection Issues

**Problem**: "Connection failed: Authentication failed"
- **Solution**: Verify your username and API key are correct
- **Tip**: Use API key (not password) for better security

**Problem**: "Project not found"
- **Solution**: Check the project name spelling (case-sensitive)
- **Tip**: Use the exact name as shown in TestRail

**Problem**: "Test run not found"
- **Solution**: Verify the test run ID is correct and accessible to your user

### Upload Issues

**Problem**: Screenshots not uploading
- **Solution**: Check that test IDs are valid and test run is active
- **Tip**: Ensure you have permission to add results to the test run

**Problem**: "Failed to upload to Test X"
- **Solution**: Check individual test case accessibility
- **Tip**: Verify the test is part of the specified test run

## Best Practices

1. **Use API Keys**: Always use TestRail API keys instead of passwords
2. **Selective Updates**: Only select relevant test cases to avoid unnecessary updates
3. **Meaningful Test Runs**: Organize your TestRail test runs by feature or sprint
4. **Review Before Upload**: Execute API tests first, then enable TestRail integration
5. **Error Handling**: Check the results section for any upload failures

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit TestRail credentials to version control
- Use environment variables for sensitive data in production
- API keys should be regenerated periodically
- Limit TestRail user permissions to only required projects

## Technical Architecture

### Components

1. **testRailService.js**: Handles all TestRail API interactions
2. **index.js**: Backend endpoints for connection and test case retrieval
3. **index.html**: UI components for TestRail configuration
4. **apiTestingAgent.js**: Core testing engine (unchanged)

### Flow Diagram

```
User Input → Connect to TestRail → Fetch Test Cases → Display with Checkboxes
                                                              ↓
                                                        User Selects Tests
                                                              ↓
API Test Execution → Generate Screenshots → Upload to Selected Tests → Display Results
```

## API Reference

### TestRailService Methods

```javascript
// Connect to TestRail
await testRailService.connect(url, username, password)

// Get projects
await testRailService.getProjects()

// Get project by name
await testRailService.getProjectByName(projectName)

// Get test run
await testRailService.getTestRun(runId)

// Get tests from run
await testRailService.getTestsFromRun(runId)

// Add test result with screenshots
await testRailService.addTestResult(testId, statusId, comment, screenshotPaths)

// Add attachment to result
await testRailService.addAttachment(resultId, screenshotPath)

// Disconnect
testRailService.disconnect()
```

## Limitations

- Maximum attachment size depends on your TestRail plan
- Screenshot upload is sequential (not parallel)
- Test status is binary (Passed/Failed) based on HTTP status code
- Requires active internet connection
- TestRail API rate limits may apply

## Future Enhancements

Potential features for future versions:
- Bulk test result updates
- Custom status mapping
- Attachment preview before upload
- TestRail custom field support
- Multiple test run support
- Scheduled test execution with TestRail updates

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server console logs for detailed error messages
3. Verify TestRail API permissions
4. Contact your TestRail administrator for access issues

## Version History

- **v1.1.0** (Current): Added TestRail integration
- **v1.0.0**: Initial release with field highlighting and Excel reporting

---

**Note**: TestRail is a trademark of Gurock Software GmbH. This integration is not officially affiliated with or endorsed by TestRail.
