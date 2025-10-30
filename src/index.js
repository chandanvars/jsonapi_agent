const express = require('express');
const cors = require('cors');
const APITestingAgent = require('./apiTestingAgent');
const chalk = require('chalk');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize API Testing Agent
const agent = new APITestingAgent();

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
            excelFileName = 'api-test-results'
        } = req.body;

        if (!apiUrl) {
            return res.status(400).json({
                success: false,
                message: 'API URL is required'
            });
        }

        console.log(chalk.blue('� Starting API test with field highlighting...'));

        const result = await agent.executeAPITest({
            apiUrl,
            method,
            headers,
            body,
            fieldsToHighlight,
            excelFileName
        });

        // Clean up browser after test completes
        await agent.cleanup();
        console.log(chalk.gray('🧹 Browser closed successfully'));

        // Prepare response with validation info
        const response = {
            success: true,
            message: 'API test completed successfully',
            data: result
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