const express = require('express');
const cors = require('cors');
const APITestingAgent = require('./apiTestingAgent');
const TestRailService = require('./testRailService');
const chalk = require('chalk');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize API Testing Agent and TestRail Service
const agent = new APITestingAgent();
const testRailService = new TestRailService();

// TestRail Routes
app.post('/api/testrail/connect', async (req, res) => {
    try {
        const { url, username, password } = req.body;

        if (!url || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'URL, username, and password are required'
            });
        }

        const result = await testRailService.connect(url, username, password);
        res.json(result);

    } catch (error) {
        console.error(chalk.red('❌ TestRail connection error:'), error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to connect to TestRail',
            error: error.message
        });
    }
});

app.post('/api/testrail/test-cases', async (req, res) => {
    try {
        const { projectName, suiteName, runId } = req.body;

        if (!projectName || !runId) {
            return res.status(400).json({
                success: false,
                message: 'Project name and run ID are required'
            });
        }

        if (!testRailService.checkConnection()) {
            return res.status(400).json({
                success: false,
                message: 'Not connected to TestRail. Please connect first.'
            });
        }

        console.log(chalk.blue(`📋 Looking up project: "${projectName}"`));
        
        // Get project by name - this will find the project ID automatically
        const project = await testRailService.getProjectByName(projectName);
        console.log(chalk.green(`✅ Found project: ${project.name} (ID: ${project.id})`));
        
        // If suite name provided, find suite ID automatically
        let suite = null;
        if (suiteName && suiteName.trim()) {
            console.log(chalk.blue(`📋 Looking up suite: "${suiteName}"`));
            suite = await testRailService.getSuiteByName(project.id, suiteName);
            console.log(chalk.green(`✅ Found suite: ${suite.name} (ID: ${suite.id})`));
        }
        
        // Get test run details - this validates the run exists and we have access
        console.log(chalk.blue(`📋 Fetching test run: ${runId}`));
        const testRun = await testRailService.getTestRun(runId);
        console.log(chalk.green(`✅ Found test run: ${testRun.name} (ID: ${testRun.id})`));
        
        // Verify test run belongs to the specified project
        if (testRun.project_id !== project.id) {
            throw new Error(`Test run ${runId} belongs to a different project. Expected project ID ${project.id}, but run is in project ID ${testRun.project_id}`);
        }
        
        // Get tests from run
        console.log(chalk.blue(`📋 Fetching test cases from run...`));
        const tests = await testRailService.getTestsFromRun(runId);

        res.json({
            success: true,
            message: 'Test cases retrieved successfully',
            testCases: tests,
            runDetails: {
                id: testRun.id,
                name: testRun.name,
                projectId: project.id,
                projectName: project.name,
                suiteId: suite ? suite.id : null,
                suiteName: suite ? suite.name : null
            }
        });

    } catch (error) {
        console.error(chalk.red('❌ Error getting test cases:'), error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to get test cases',
            error: error.message
        });
    }
});

// Routes
app.post('/api/test', async (req, res) => {
    try {
        const { 
            apiUrl, 
            method = 'GET', 
            headers = {}, 
            body = null,
            fieldsToHighlight = {
                request: [],
                response: []
            },
            excelFileName = 'api-test-results',
            appendMode = false,
            testCaseName = '',
            testrail = {
                enabled: false,
                selectedTestCases: []
            }
        } = req.body;

        if (!apiUrl) {
            return res.status(400).json({
                success: false,
                message: 'API URL is required'
            });
        }

        // Validate test case name when append mode is enabled
        if (appendMode && !testCaseName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Test case name is required when append mode is enabled'
            });
        }

        console.log(chalk.blue('🚀 Starting API test with field highlighting...'));

        if (appendMode) {
            console.log(chalk.cyan(`📑 Append mode enabled - Test case: ${testCaseName}`));
        }

        if (testrail.enabled && testrail.selectedTestCases.length > 0) {
            console.log(chalk.cyan(`🔗 TestRail integration enabled - ${testrail.selectedTestCases.length} test case(s) selected`));
        }

        const result = await agent.executeAPITest({
            apiUrl,
            method,
            headers,
            body,
            fieldsToHighlight,
            excelFileName,
            appendMode,
            testCaseName
        });

        // Upload screenshots to TestRail if enabled
        let testrailResults = null;
        if (testrail.enabled && testrail.selectedTestCases.length > 0) {
            console.log(chalk.blue('📤 Uploading screenshots to TestRail...'));
            console.log(chalk.gray(`   Run ID: ${testrail.runId}`));
            console.log(chalk.gray(`   Selected cases: ${JSON.stringify(testrail.selectedTestCases)}`));
            
            if (!testrail.runId) {
                console.error(chalk.red('❌ TestRail run ID is required'));
                throw new Error('TestRail run ID is required for uploading results');
            }
            
            testrailResults = [];
            for (const testCase of testrail.selectedTestCases) {
                try {
                    // Determine status based on API response
                    const statusId = result.response.status >= 200 && result.response.status < 300 ? 1 : 5; // 1=Passed, 5=Failed
                    
                    // Get all screenshot paths
                    const screenshotPaths = Object.values(result.screenshots);
                    
                    // Add test result using case ID and run ID (like Java implementation)
                    const testResult = await testRailService.addResultForCase(
                        testrail.runId,
                        testCase.caseId,
                        statusId,
                        `API Test Result\nEndpoint: ${apiUrl}\nMethod: ${method}\nStatus: ${result.response.status} ${result.response.statusText}\n\nTimestamp: ${new Date().toLocaleString()}`,
                        screenshotPaths
                    );
                    
                    testrailResults.push({
                        caseId: testCase.caseId,
                        testId: testCase.id,
                        testTitle: testCase.title,
                        ...testResult
                    });
                    
                    console.log(chalk.green(`✅ Uploaded to Case ${testCase.caseId} (Test ${testCase.id}): ${testCase.title}`));
                } catch (trError) {
                    console.error(chalk.red(`❌ Failed to upload to Case ${testCase.caseId}:`), trError.message);
                    testrailResults.push({
                        caseId: testCase.caseId,
                        testId: testCase.id,
                        testTitle: testCase.title,
                        success: false,
                        error: trError.message
                    });
                }
            }
        }

        // Clean up browser after test completes
        await agent.cleanup();
        console.log(chalk.gray('🧹 Browser closed successfully'));

        // Prepare response with validation info
        const response = {
            success: true,
            message: 'API test completed successfully',
            data: {
                ...result,
                testrailResults: testrailResults
            }
        };

        // Add validation warnings if any fields were corrected
        if (result.validation && result.validation.issues.length > 0) {
            response.warning = {
                message: 'Some field names were invalid and have been corrected',
                issues: result.validation.issues,
                correctedFields: result.validation.correctedFields
            };
        }

        res.json(response);

    } catch (error) {
        console.error(chalk.red('❌ API test failed:'), error.message);
        
        // Ensure cleanup even on error
        try {
            await agent.cleanup();
        } catch (cleanupError) {
            console.error(chalk.red('Cleanup error:'), cleanupError.message);
        }
        
        res.status(500).json({
            success: false,
            message: 'API test failed',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Testing Agent is running' });
});

// Start server
app.listen(port, () => {
    console.log(chalk.green(`🌟 API Testing Agent server running on port ${port}`));
    console.log(chalk.cyan(`📖 Health check: http://localhost:${port}/health`));
    console.log(chalk.cyan(`🔧 API endpoint: POST http://localhost:${port}/api/test`));
});

module.exports = app;