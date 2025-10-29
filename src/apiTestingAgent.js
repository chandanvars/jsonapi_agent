const axios = require('axios');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class APITestingAgent {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotsDir = path.join(__dirname, '..', 'screenshots');
        this.excelDir = path.join(__dirname, '..', 'reports');
        
        // Ensure directories exist
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.screenshotsDir, this.excelDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new', // Run in headless mode (new headless engine)
                defaultViewport: null,
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--force-device-scale-factor=1'
                ]
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
        }
    }

    async executeAPITest({ apiUrl, method, headers, body, fieldsToHighlight, excelFileName }) {
        try {
            console.log(chalk.blue('🔧 Initializing browser...'));
            await this.initBrowser();

            // Execute API call
            console.log(chalk.yellow('📡 Executing API call...'));
            const apiResponse = await this.makeAPICall(apiUrl, method, headers, body);

            // Create HTML visualization
            console.log(chalk.yellow('🎨 Creating visual representation...'));
            const htmlContent = this.createHTMLVisualization(
                { url: apiUrl, method, headers, body },
                apiResponse,
                fieldsToHighlight
            );

            // Take screenshots
            console.log(chalk.yellow('📸 Taking screenshots...'));
            const screenshots = await this.takeScreenshots(htmlContent, excelFileName);

            // Generate Excel report
            console.log(chalk.yellow('📊 Generating Excel report...'));
            const excelPath = await this.generateExcelReport(
                { url: apiUrl, method, headers, body },
                apiResponse,
                screenshots,
                excelFileName
            );

            console.log(chalk.green('✅ API test completed successfully!'));

            return {
                request: { url: apiUrl, method, headers, body },
                response: {
                    status: apiResponse.status,
                    statusText: apiResponse.statusText,
                    data: apiResponse.data,
                    headers: apiResponse.headers
                },
                screenshots: screenshots,
                excelReport: excelPath,
                fieldsHighlighted: fieldsToHighlight
            };

        } catch (error) {
            console.error(chalk.red('❌ Error in executeAPITest:'), error);
            throw error;
        }
    }

    async makeAPICall(url, method, headers, body) {
        try {
            const config = {
                method: method.toLowerCase(),
                url: url,
                headers: headers,
                timeout: 30000
            };

            if (body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
                config.data = body;
            }

            const response = await axios(config);
            return response;

        } catch (error) {
            if (error.response) {
                return error.response; // Return error response for analysis
            }
            throw error;
        }
    }

    createHTMLVisualization(request, response, fieldsToHighlight) {
        const requestJSON = JSON.stringify({
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body
        }, null, 2);

        const responseJSON = JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        }, null, 2);

        // Function to highlight fields in JSON text - precise matching only
        const highlightFields = (jsonText, fields, className) => {
            let highlighted = jsonText;
            fields.forEach(field => {
                // Escape special regex characters in field name
                const escapedField = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Only highlight the field name and simple values (not nested structures)
                const patterns = [
                    // String values
                    `("${escapedField}"\\s*:\\s*"[^"]*")`,
                    // Number values (integer or decimal)
                    `("${escapedField}"\\s*:\\s*\\d+\\.?\\d*)`,
                    // Boolean values
                    `("${escapedField}"\\s*:\\s*(?:true|false))`,
                    // Null values
                    `("${escapedField}"\\s*:\\s*null)`,
                    // Array values - but only simple arrays on one line
                    `("${escapedField}"\\s*:\\s*\\[[^\\[\\]]*?\\])`,
                ];
                
                patterns.forEach(pattern => {
                    const regex = new RegExp(pattern, 'gi');
                    highlighted = highlighted.replace(regex, (match, captured) => {
                        // Only replace if not already highlighted
                        if (match.includes('<span')) return match;
                        return `<span class="${className}">${captured}</span>`;
                    });
                });
            });
            return highlighted;
        };

        // Highlight fields in request and response
        const highlightedRequest = highlightFields(requestJSON, fieldsToHighlight.request || [], 'highlight-request');
        const highlightedResponse = highlightFields(responseJSON, fieldsToHighlight.response || [], 'highlight-response');

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>API Test Results</title>
            <style>
                body {
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    margin: 40px auto;
                    background-color: #f8f9fa;
                    max-width: 1400px;
                    padding: 0 20px;
                }
                .container {
                    width: 100%;
                }
                .section {
                    background: white;
                    border-radius: 12px;
                    padding: 50px;
                    margin-bottom: 40px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border: 1px solid #e9ecef;
                }
                .section h2 {
                    color: #000000;
                    border-bottom: 3px solid #007acc;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                    font-size: 24px;
                    font-weight: 700;
                }
                .json-content {
                    background: #ffffff;
                    color: #000000;
                    padding: 30px;
                    border-radius: 8px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    font-size: 14px;
                    line-height: 1.8;
                    min-height: 500px;
                    border: 2px solid #cbd5e0;
                    font-family: 'Consolas', 'Courier New', monospace;
                    max-width: 100%;
                    word-break: break-word;
                    font-weight: 400;
                }
                .highlight-request {
                    background-color: #ffeb3b !important;
                    color: #000000 !important;
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                    font-weight: 700 !important;
                    border: 3px solid #ff9800 !important;
                    box-shadow: 0 4px 8px rgba(255, 235, 59, 0.7) !important;
                    font-size: 16px !important;
                    display: inline-block !important;
                    margin: 3px !important;
                }
                .highlight-response {
                    background-color: #4caf50 !important;
                    color: #ffffff !important;
                    padding: 8px 12px !important;
                    border-radius: 6px !important;
                    font-weight: 700 !important;
                    border: 3px solid #2e7d32 !important;
                    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.7) !important;
                    font-size: 16px !important;
                    display: inline-block !important;
                    margin: 3px !important;
                }
                .status-success { color: #4caf50; }
                .status-error { color: #f44336; }
                .timestamp {
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 36px; color: #2d3748; margin-bottom: 10px;">🚀 API Test Results</h1>
                    <p class="timestamp" style="font-size: 16px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="section">
                    <h2>📤 Request Details</h2>
                    <div class="json-content">${highlightedRequest}</div>
                </div>
                
                <div class="section">
                    <h2>📥 Response Details</h2>
                    <div class="json-content">${highlightedResponse}</div>
                </div>
                
                <div class="section">
                    <h2>🎯 Highlighted Fields Summary</h2>
                    <div style="background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); padding: 30px; border-radius: 12px; margin: 20px 0; border: 2px solid #bee3f8;">
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 20px;">📤 Request Fields:</h3>
                            <div style="line-height: 2.5;">
                                ${fieldsToHighlight.request?.map(f => `<span class="highlight-request">${f}</span>`).join(' ') || '<span style="color: #666; font-style: italic;">No fields selected</span>'}
                            </div>
                        </div>
                        <div>
                            <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 20px;">📥 Response Fields:</h3>
                            <div style="line-height: 2.5;">
                                ${fieldsToHighlight.response?.map(f => `<span class="highlight-response">${f}</span>`).join(' ') || '<span style="color: #666; font-style: italic;">No fields selected</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async takeScreenshots(htmlContent, fileName) {
        try {
            // Create temporary HTML file
            const tempHtmlPath = path.join(this.screenshotsDir, 'temp.html');
            fs.writeFileSync(tempHtmlPath, htmlContent);

            // Navigate to the HTML file
            await this.page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
            
            // Wait a bit more for rendering
            await this.page.waitForTimeout(2000);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshots = [];
            
            // Take full page screenshot
            const fullScreenshotPath = path.join(this.screenshotsDir, `${fileName}_full_${timestamp}.png`);
            await this.page.screenshot({ 
                path: fullScreenshotPath, 
                fullPage: true,
                type: 'png',
                omitBackground: false
            });
            screenshots.push(fullScreenshotPath);

            // Helper function to group nearby elements more intelligently
            const groupNearbyElements = (boxes) => {
                if (boxes.length === 0) return [];
                if (boxes.length === 1) return [boxes];
                
                // Sort by vertical position
                const sorted = [...boxes].sort((a, b) => a.y - b.y);
                const groups = [];
                let currentGroup = [sorted[0]];
                
                for (let i = 1; i < sorted.length; i++) {
                    const lastInGroup = currentGroup[currentGroup.length - 1];
                    const current = sorted[i];
                    
                    // Calculate vertical distance from last element in current group
                    const verticalDistance = current.y - (lastInGroup.y + lastInGroup.height);
                    
                    // Group if within 100px vertically
                    if (verticalDistance <= 100) {
                        currentGroup.push(current);
                    } else {
                        groups.push(currentGroup);
                        currentGroup = [current];
                    }
                }
                groups.push(currentGroup);
                return groups;
            };

            // Get parent container for request section to capture context
            const requestSection = await this.page.$('.section:nth-child(2) .json-content');
            const requestHighlights = await this.page.$$('.section:nth-child(2) .highlight-request');
            
            if (requestHighlights.length > 0) {
                console.log(chalk.cyan(`📸 Processing ${requestHighlights.length} request field(s)...`));
                
                // Get bounding boxes
                const requestBoxes = [];
                for (const highlight of requestHighlights) {
                    const box = await highlight.boundingBox();
                    if (box) requestBoxes.push(box);
                }
                
                // Group nearby elements
                const groups = groupNearbyElements(requestBoxes);
                console.log(chalk.cyan(`  → Grouped into ${groups.length} screenshot(s)`));
                
                // Capture each group with surrounding context
                for (let g = 0; g < groups.length; g++) {
                    const group = groups[g];
                    
                    // Get min/max bounds of all highlighted elements in group
                    const minX = Math.min(...group.map(b => b.x));
                    const minY = Math.min(...group.map(b => b.y));
                    const maxX = Math.max(...group.map(b => b.x + b.width));
                    const maxY = Math.max(...group.map(b => b.y + b.height));
                    
                    // Get section bounds for reference
                    const sectionBox = await requestSection.boundingBox();
                    
                    // Add generous padding and ensure we capture full line context
                    const verticalPadding = 80;
                    const horizontalPadding = 50;
                    
                    const clip = {
                        x: Math.max(sectionBox.x, minX - horizontalPadding),
                        y: Math.max(sectionBox.y, minY - verticalPadding),
                        width: Math.min(sectionBox.width, maxX - minX + horizontalPadding * 3),
                        height: Math.min(sectionBox.height, maxY - minY + verticalPadding * 2)
                    };
                    
                    const screenshotPath = path.join(this.screenshotsDir, `${fileName}_request_group${g + 1}_${timestamp}.png`);
                    await this.page.screenshot({ 
                        path: screenshotPath,
                        clip: clip,
                        type: 'png'
                    });
                    screenshots.push(screenshotPath);
                    console.log(chalk.green(`  ✓ Captured request group ${g + 1} (${group.length} field${group.length > 1 ? 's' : ''})`));
                }
            } else {
                // No highlighted fields found - capture full request section as fallback
                console.log(chalk.yellow(`⚠️  No request fields highlighted - capturing full request section`));
                if (requestSection) {
                    const screenshotPath = path.join(this.screenshotsDir, `${fileName}_request_full_${timestamp}.png`);
                    await requestSection.screenshot({ 
                        path: screenshotPath,
                        type: 'png'
                    });
                    screenshots.push(screenshotPath);
                    console.log(chalk.green(`  ✓ Captured full request section`));
                }
            }

            // Get parent container for response section to capture context
            const responseSection = await this.page.$('.section:nth-child(3) .json-content');
            const responseHighlights = await this.page.$$('.section:nth-child(3) .highlight-response');
            
            if (responseHighlights.length > 0) {
                console.log(chalk.cyan(`📸 Processing ${responseHighlights.length} response field(s)...`));
                
                // Get bounding boxes
                const responseBoxes = [];
                for (const highlight of responseHighlights) {
                    const box = await highlight.boundingBox();
                    if (box) responseBoxes.push(box);
                }
                
                // Group nearby elements
                const groups = groupNearbyElements(responseBoxes);
                console.log(chalk.cyan(`  → Grouped into ${groups.length} screenshot(s)`));
                
                // Capture each group with surrounding context
                for (let g = 0; g < groups.length; g++) {
                    const group = groups[g];
                    
                    // Get min/max bounds of all highlighted elements in group
                    const minX = Math.min(...group.map(b => b.x));
                    const minY = Math.min(...group.map(b => b.y));
                    const maxX = Math.max(...group.map(b => b.x + b.width));
                    const maxY = Math.max(...group.map(b => b.y + b.height));
                    
                    // Get section bounds for reference
                    const sectionBox = await responseSection.boundingBox();
                    
                    // Add generous padding and ensure we capture full line context
                    const verticalPadding = 80;
                    const horizontalPadding = 50;
                    
                    const clip = {
                        x: Math.max(sectionBox.x, minX - horizontalPadding),
                        y: Math.max(sectionBox.y, minY - verticalPadding),
                        width: Math.min(sectionBox.width, maxX - minX + horizontalPadding * 3),
                        height: Math.min(sectionBox.height, maxY - minY + verticalPadding * 2)
                    };
                    
                    const screenshotPath = path.join(this.screenshotsDir, `${fileName}_response_group${g + 1}_${timestamp}.png`);
                    await this.page.screenshot({ 
                        path: screenshotPath,
                        clip: clip,
                        type: 'png'
                    });
                    screenshots.push(screenshotPath);
                    console.log(chalk.green(`  ✓ Captured response group ${g + 1} (${group.length} field${group.length > 1 ? 's' : ''})`));
                }
            } else {
                // No highlighted fields found - capture full response section as fallback
                console.log(chalk.yellow(`⚠️  No response fields highlighted - capturing full response section`));
                if (responseSection) {
                    const screenshotPath = path.join(this.screenshotsDir, `${fileName}_response_full_${timestamp}.png`);
                    await responseSection.screenshot({ 
                        path: screenshotPath,
                        type: 'png'
                    });
                    screenshots.push(screenshotPath);
                    console.log(chalk.green(`  ✓ Captured full response section`));
                }
            }

            // Clean up temporary HTML file
            fs.unlinkSync(tempHtmlPath);

            console.log(chalk.green(`✅ Total screenshots captured: ${screenshots.length}`));
            return screenshots;

        } catch (error) {
            console.error(chalk.red('Screenshot error:'), error);
            throw error;
        }
    }

    async generateExcelReport(request, response, screenshots, fileName) {
        try {
            const workbook = new ExcelJS.Workbook();
            
            // API Details Worksheet
            const apiSheet = workbook.addWorksheet('API Test Details');
            
            // Set column widths
            apiSheet.columns = [
                { header: 'Property', key: 'property', width: 25 },
                { header: 'Value', key: 'value', width: 80 }
            ];

            // Add API request details
            apiSheet.addRow({ property: 'Test Timestamp', value: new Date().toLocaleString() });
            apiSheet.addRow({ property: 'API URL', value: request.url });
            apiSheet.addRow({ property: 'HTTP Method', value: request.method });
            apiSheet.addRow({ property: 'Request Headers', value: JSON.stringify(request.headers, null, 2) });
            apiSheet.addRow({ property: 'Request Body', value: JSON.stringify(request.body, null, 2) });
            apiSheet.addRow({ property: 'Response Status', value: `${response.status} ${response.statusText}` });
            apiSheet.addRow({ property: 'Response Headers', value: JSON.stringify(response.headers, null, 2) });
            apiSheet.addRow({ property: 'Response Data', value: JSON.stringify(response.data, null, 2) });

            // Style the header row
            apiSheet.getRow(1).font = { bold: true };
            apiSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE6F3FF' }
            };

            // Screenshots Worksheet
            const screenshotSheet = workbook.addWorksheet('Screenshots');
            screenshotSheet.getColumn(1).width = 120;
            
            // Add images to Excel
            let currentRow = 1;
            
            // screenshots is now an array of file paths
            if (screenshots && screenshots.length > 0) {
                for (let i = 0; i < screenshots.length; i++) {
                    const screenshotPath = screenshots[i];
                    
                    if (fs.existsSync(screenshotPath)) {
                        const imageId = workbook.addImage({
                            filename: screenshotPath,
                            extension: 'png',
                        });
                        
                        // Extract label from filename
                        const filename = path.basename(screenshotPath);
                        let label = 'Screenshot';
                        
                        if (filename.includes('_full_')) {
                            label = 'Full Page Screenshot';
                        } else if (filename.includes('_request_group')) {
                            const groupNum = filename.match(/group(\d+)/)?.[1] || (i + 1);
                            label = `Request Fields - Group ${groupNum}`;
                        } else if (filename.includes('_response_group')) {
                            const groupNum = filename.match(/group(\d+)/)?.[1] || (i + 1);
                            label = `Response Fields - Group ${groupNum}`;
                        } else if (filename.includes('_request_field')) {
                            const fieldNum = filename.match(/field(\d+)/)?.[1] || (i + 1);
                            label = `Request Field ${fieldNum}`;
                        } else if (filename.includes('_response_field')) {
                            const fieldNum = filename.match(/field(\d+)/)?.[1] || (i + 1);
                            label = `Response Field ${fieldNum}`;
                        }
                        
                        // Add label
                        screenshotSheet.getCell(`A${currentRow}`).value = label;
                        screenshotSheet.getCell(`A${currentRow}`).font = { bold: true, size: 14, color: { argb: 'FF0066CC' } };
                        screenshotSheet.getCell(`A${currentRow}`).fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE6F3FF' }
                        };
                        currentRow += 2;
                        
                        // Add image with proper sizing
                        // For group/field screenshots, use moderate fixed size
                        // For full page, scale down more
                        let imageSize;
                        if (filename.includes('_full_')) {
                            imageSize = { width: 900, height: 700 };
                        } else if (filename.includes('_group') || filename.includes('_field')) {
                            // Use a reasonable size that shows detail without stretching
                            imageSize = { width: 800, height: 300 };
                        } else {
                            imageSize = { width: 800, height: 400 };
                        }
                        
                        screenshotSheet.addImage(imageId, {
                            tl: { col: 0, row: currentRow },
                            ext: imageSize
                        });
                        
                        currentRow += filename.includes('_full_') ? 38 : 18;
                        currentRow += 2; // Extra spacing between images
                    }
                }
            }

            // Save Excel file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const excelPath = path.join(this.excelDir, `${fileName}_${timestamp}.xlsx`);
            await workbook.xlsx.writeFile(excelPath);

            console.log(chalk.green(`📊 Excel report saved: ${excelPath}`));
            return excelPath;

        } catch (error) {
            console.error(chalk.red('Excel generation error:'), error);
            throw error;
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

module.exports = APITestingAgent;