const Testrail = require('testrail-api');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const FormData = require('form-data');
const axios = require('axios');

class TestRailService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionDetails = null;
    }

    /**
     * Connect to TestRail
     * @param {string} url - TestRail URL (e.g., https://yourcompany.testrail.io)
     * @param {string} username - TestRail username
     * @param {string} password - TestRail password or API key
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async connect(url, username, password) {
        try {
            console.log(chalk.blue('🔗 Connecting to TestRail...'));
            console.log(chalk.gray(`   URL: ${url}`));
            console.log(chalk.gray(`   User: ${username}`));
            
            // Clean up URL - ensure proper format
            let cleanUrl = url.trim().replace(/\/+$/, '');
            
            // If user provided full API path, extract base URL
            if (cleanUrl.includes('/index.php')) {
                cleanUrl = cleanUrl.split('/index.php')[0];
            }
            
            // Ensure URL has proper protocol
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }
            
            console.log(chalk.gray(`   Clean URL: ${cleanUrl}`));
            console.log(chalk.gray(`   API Path: ${cleanUrl}/index.php?/api/v2/`));
            
            // Initialize TestRail client
            this.client = new Testrail({
                host: cleanUrl,
                user: username,
                password: password
            });

            console.log(chalk.yellow('   Testing connection...'));
            
            // Simple connection test - just verify credentials work
            const projectsResponse = await this.client.getProjects();
            
            // Parse response based on TestRail API format
            let projects = null;
            
            if (projectsResponse.body && projectsResponse.body.projects) {
                // New format: { body: { projects: [...], offset: 0, limit: 250 } }
                projects = projectsResponse.body.projects;
            } else if (projectsResponse.body && Array.isArray(projectsResponse.body)) {
                // Old format: { body: [...] }
                projects = projectsResponse.body;
            } else if (Array.isArray(projectsResponse)) {
                // Direct array
                projects = projectsResponse;
            } else {
                throw new Error('Unable to parse TestRail API response');
            }
            
            if (!projects || !Array.isArray(projects)) {
                throw new Error('Invalid response format from TestRail API');
            }
            
            if (projects.length === 0) {
                throw new Error('Connected successfully but no projects found. You may not have access to any projects.');
            }
            
            // Connection successful
            this.isConnected = true;
            this.connectionDetails = { url: cleanUrl, username };
            console.log(chalk.green(`✅ Connected to TestRail successfully!`));
            
            return {
                success: true,
                message: 'Connected to TestRail successfully'
            }
        } catch (error) {
            console.error(chalk.red('❌ TestRail connection failed:'), error.message);
            
            // Log full error for debugging
            if (error.response) {
                console.log(chalk.red('   Error response status:'), error.response.statusCode);
                console.log(chalk.red('   Error response body:'), error.response.body);
            }
            
            // Provide more detailed error messages
            let errorMessage = error.message;
            
            if (error.response) {
                const statusCode = error.response.statusCode;
                const responseBody = error.response.body;
                
                if (statusCode === 401) {
                    errorMessage = 'Authentication failed (401). Please check:\n1. Username (email) is correct\n2. Using API Key (not password)\n3. API Key is valid and not expired';
                } else if (statusCode === 403) {
                    errorMessage = 'Access forbidden (403). Your account may not have:\n1. API access enabled\n2. Permission to view projects\n3. Required role/permissions';
                } else if (statusCode === 404) {
                    errorMessage = 'API endpoint not found (404). Please verify the TestRail URL';
                } else if (responseBody && responseBody.error) {
                    errorMessage = `TestRail API Error: ${responseBody.error}`;
                }
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                errorMessage = 'Cannot reach TestRail server. Please check the URL (e.g., https://yourcompany.testrail.io)';
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused. The TestRail server may be down or the URL is incorrect';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Connection timeout. The server is not responding';
            }
            
            this.isConnected = false;
            this.client = null;
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }

    /**
     * Check if connected to TestRail
     * @returns {boolean}
     */
    checkConnection() {
        return this.isConnected && this.client !== null;
    }

    /**
     * Get all projects
     * @returns {Promise<Array>}
     */
    async getProjects() {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            const projectsResponse = await this.client.getProjects();
            
            // Parse response based on TestRail API format
            if (projectsResponse.body && projectsResponse.body.projects) {
                // New format: { body: { projects: [...], offset: 0, limit: 250 } }
                return projectsResponse.body.projects;
            } else if (projectsResponse.body && Array.isArray(projectsResponse.body)) {
                // Old format: { body: [...] }
                return projectsResponse.body;
            } else if (Array.isArray(projectsResponse)) {
                // Direct array
                return projectsResponse;
            } else {
                throw new Error('Unable to parse projects response');
            }
        } catch (error) {
            console.error(chalk.red('Error getting projects:'), error.message);
            throw error;
        }
    }

    /**
     * Get project by name
     * @param {string} projectName - Project name
     * @returns {Promise<Object>}
     */
    async getProjectByName(projectName) {
        try {
            const projects = await this.getProjects();
            const project = projects.find(p => 
                p.name.toLowerCase() === projectName.toLowerCase()
            );
            
            if (!project) {
                throw new Error(`Project "${projectName}" not found`);
            }
            
            return project;
        } catch (error) {
            console.error(chalk.red('Error finding project:'), error.message);
            throw error;
        }
    }

    /**
     * Get test suites for a project
     * @param {number} projectId - Project ID
     * @returns {Promise<Array>}
     */
    async getSuites(projectId) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            const suitesResponse = await this.client.getSuites(projectId);
            
            // Parse response based on TestRail API format
            if (suitesResponse.body && Array.isArray(suitesResponse.body)) {
                return suitesResponse.body;
            } else if (Array.isArray(suitesResponse)) {
                return suitesResponse;
            } else {
                throw new Error('Unable to parse suites response');
            }
        } catch (error) {
            console.error(chalk.red('Error getting suites:'), error.message);
            throw error;
        }
    }

    /**
     * Get test suite by name
     * @param {number} projectId - Project ID
     * @param {string} suiteName - Suite name
     * @returns {Promise<Object>}
     */
    async getSuiteByName(projectId, suiteName) {
        try {
            const suites = await this.getSuites(projectId);
            const suite = suites.find(s => 
                s.name.toLowerCase() === suiteName.toLowerCase()
            );
            
            if (!suite) {
                throw new Error(`Suite "${suiteName}" not found`);
            }
            
            return suite;
        } catch (error) {
            console.error(chalk.red('Error finding suite:'), error.message);
            throw error;
        }
    }

    /**
     * Get test run details
     * @param {number} runId - Test run ID
     * @returns {Promise<Object>}
     */
    async getTestRun(runId) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            console.log(chalk.blue(`📋 Fetching test run ${runId}...`));
            const run = await this.client.getRun(runId);
            return run.body;
        } catch (error) {
            console.error(chalk.red('Error getting test run:'), error.message);
            throw error;
        }
    }

    /**
     * Get tests from a test run
     * @param {number} runId - Test run ID
     * @returns {Promise<Array>}
     */
    async getTestsFromRun(runId) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            console.log(chalk.blue(`📝 Fetching tests from run ${runId}...`));
            const testsResponse = await this.client.getTests(runId);
            
            // Parse response based on TestRail API format
            let testList = null;
            
            if (testsResponse.body && testsResponse.body.tests) {
                // New format with pagination: { body: { tests: [...], offset: 0, limit: 250 } }
                testList = testsResponse.body.tests;
            } else if (testsResponse.body && Array.isArray(testsResponse.body)) {
                // Old format: { body: [...] }
                testList = testsResponse.body;
            } else if (Array.isArray(testsResponse)) {
                // Direct array
                testList = testsResponse;
            } else {
                throw new Error('Unable to parse tests response');
            }
            
            console.log(chalk.green(`✅ Found ${testList.length} test(s) in run`));
            
            // Return simplified test data
            return testList.map(test => ({
                id: test.id,
                caseId: test.case_id,
                title: test.title,
                statusId: test.status_id,
                assignedTo: test.assignedto_id,
                refs: test.refs
            }));
        } catch (error) {
            console.error(chalk.red('Error getting tests from run:'), error.message);
            throw error;
        }
    }

    /**
     * Add screenshot attachment to a test result
     * @param {number} resultId - Test result ID
     * @param {string} screenshotPath - Path to screenshot file
     * @returns {Promise<Object>}
     */
    async addAttachment(resultId, screenshotPath) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            if (!fs.existsSync(screenshotPath)) {
                throw new Error(`Screenshot file not found: ${screenshotPath}`);
            }

            console.log(chalk.blue(`📎 Uploading screenshot to result ${resultId}...`));
            
            const fileName = path.basename(screenshotPath);
            
            // TestRail doesn't support file uploads via the testrail-api package
            // We need to use the raw HTTP API with form-data
            const form = new FormData();
            form.append('attachment', fs.createReadStream(screenshotPath));
            
            // Build URL and auth
            const url = `${this.connectionDetails.url}/index.php?/api/v2/add_attachment_to_result/${resultId}`;
            const auth = Buffer.from(`${this.connectionDetails.username}:${this.client.password}`).toString('base64');
            
            // Upload using axios
            const response = await axios.post(url, form, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    ...form.getHeaders()
                }
            });
            
            console.log(chalk.green(`✅ Screenshot uploaded: ${fileName}`));
            return response.data;
        } catch (error) {
            console.error(chalk.red('Error adding attachment:'), error.message);
            throw error;
        }
    }

    /**
     * Add test result using case ID and run ID (like Java implementation)
     * @param {number} runId - Test run ID
     * @param {number} caseId - Test case ID
     * @param {number} statusId - Status ID (1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed)
     * @param {string} comment - Comment/note for the result
     * @param {Array<string>} screenshotPaths - Array of screenshot file paths
     * @returns {Promise<Object>}
     */
    async addResultForCase(runId, caseId, statusId, comment, screenshotPaths = []) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            console.log(chalk.blue(`📊 Adding test result for case ${caseId} in run ${runId}...`));
            
            // Add the test result using case ID (like Java: add_result_for_case/{run_id}/{case_id})
            const result = await this.client.addResultForCase(runId, caseId, {
                status_id: statusId,
                comment: comment
            });
            
            const resultId = result.body.id;
            console.log(chalk.green(`✅ Test result created: ${resultId}`));
            
            // Upload screenshots if provided
            if (screenshotPaths && screenshotPaths.length > 0) {
                console.log(chalk.blue(`📸 Uploading ${screenshotPaths.length} screenshot(s)...`));
                
                for (const screenshotPath of screenshotPaths) {
                    try {
                        await this.addAttachment(resultId, screenshotPath);
                    } catch (attachError) {
                        console.error(chalk.yellow(`⚠️  Failed to upload ${path.basename(screenshotPath)}:`, attachError.message));
                    }
                }
            }
            
            return {
                success: true,
                resultId: resultId,
                caseId: caseId,
                runId: runId,
                screenshotsUploaded: screenshotPaths.length
            };
        } catch (error) {
            console.error(chalk.red('Error adding test result:'), error.message);
            throw error;
        }
    }

    /**
     * Add test result with screenshots (using test ID)
     * @param {number} testId - Test ID
     * @param {number} statusId - Status ID (1=Passed, 2=Blocked, 3=Untested, 4=Retest, 5=Failed)
     * @param {string} comment - Comment/note for the result
     * @param {Array<string>} screenshotPaths - Array of screenshot file paths
     * @returns {Promise<Object>}
     */
    async addTestResult(testId, statusId, comment, screenshotPaths = []) {
        if (!this.checkConnection()) {
            throw new Error('Not connected to TestRail');
        }

        try {
            console.log(chalk.blue(`📊 Adding test result for test ${testId}...`));
            
            // Add the test result first
            const result = await this.client.addResult(testId, {
                status_id: statusId,
                comment: comment
            });
            
            const resultId = result.body.id;
            console.log(chalk.green(`✅ Test result created: ${resultId}`));
            
            // Upload screenshots if provided
            if (screenshotPaths && screenshotPaths.length > 0) {
                console.log(chalk.blue(`📸 Uploading ${screenshotPaths.length} screenshot(s)...`));
                
                for (const screenshotPath of screenshotPaths) {
                    try {
                        await this.addAttachment(resultId, screenshotPath);
                    } catch (attachError) {
                        console.error(chalk.yellow(`⚠️  Failed to upload ${path.basename(screenshotPath)}:`, attachError.message));
                    }
                }
            }
            
            return {
                success: true,
                resultId: resultId,
                testId: testId,
                screenshotsUploaded: screenshotPaths.length
            };
        } catch (error) {
            console.error(chalk.red('Error adding test result:'), error.message);
            throw error;
        }
    }

    /**
     * Disconnect from TestRail
     */
    disconnect() {
        this.client = null;
        this.isConnected = false;
        this.connectionDetails = null;
        console.log(chalk.gray('🔌 Disconnected from TestRail'));
    }
}

module.exports = TestRailService;
