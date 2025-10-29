const APITestingAgent = require('./src/apiTestingAgent');
const chalk = require('chalk');

// Example usage of the API Testing Agent
async function exampleUsage() {
    const agent = new APITestingAgent();

    try {
        console.log(chalk.blue('🚀 Running API Testing Agent Example...\n'));

        const testConfig = {
            apiUrl: 'https://jsonplaceholder.typicode.com/posts/1',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'API-Testing-Agent'
            },
            body: null,
            fieldsToHighlight: {
                request: ['url', 'method'],
                response: ['id', 'title', 'userId']
            },
            excelFileName: 'example-api-test'
        };

        const result = await agent.executeAPITest(testConfig);

        console.log(chalk.green('\n✅ Test completed successfully!'));
        console.log(chalk.cyan('📊 Results:'));
        console.log(`   Screenshots: ${Object.keys(result.screenshots).length} files`);
        console.log(`   Excel Report: ${result.excelReport}`);
        console.log(`   API Status: ${result.response.status} ${result.response.statusText}`);

    } catch (error) {
        console.error(chalk.red('❌ Test failed:'), error.message);
    } finally {
        await agent.cleanup();
    }
}

// Run example if this file is executed directly
if (require.main === module) {
    exampleUsage();
}

module.exports = { exampleUsage };