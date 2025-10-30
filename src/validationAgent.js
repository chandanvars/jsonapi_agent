const chalk = require('chalk');

class ValidationAgent {
    constructor() {
        this.validationRules = {
            // HTTP methods that only support url and method in request
            readOnlyMethods: ['GET', 'HEAD', 'OPTIONS'],
            // HTTP methods that support request body
            bodyMethods: ['POST', 'PUT', 'PATCH']
        };
    }

    /**
     * Recursively extract all field names from a JSON object
     */
    extractFieldNames(obj, prefix = '') {
        const fields = new Set();
        
        const traverse = (current, path) => {
            if (current === null || current === undefined) return;
            
            if (typeof current === 'object' && !Array.isArray(current)) {
                // Object - add all keys
                Object.keys(current).forEach(key => {
                    const fullPath = path ? `${path}.${key}` : key;
                    fields.add(key); // Add just the key name
                    fields.add(fullPath); // Add full path
                    traverse(current[key], fullPath);
                });
            } else if (Array.isArray(current)) {
                // Array - traverse first element if exists
                if (current.length > 0) {
                    traverse(current[0], path);
                }
            }
        };
        
        traverse(obj, prefix);
        return Array.from(fields);
    }

    /**
     * Find similar field names (for typo suggestions)
     */
    findSimilarFields(targetField, availableFields) {
        const target = targetField.toLowerCase();
        const suggestions = [];
        
        availableFields.forEach(field => {
            const fieldLower = field.toLowerCase();
            
            // Exact match (case-insensitive)
            if (fieldLower === target) {
                suggestions.push(field);
                return;
            }
            
            // Contains substring
            if (fieldLower.includes(target) || target.includes(fieldLower)) {
                suggestions.push(field);
            }
            
            // Levenshtein distance (simple version)
            if (this.calculateSimilarity(target, fieldLower) > 0.6) {
                suggestions.push(field);
            }
        });
        
        return suggestions.slice(0, 3); // Return top 3 suggestions
    }

    /**
     * Calculate similarity between two strings (0 to 1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Validate request fields based on HTTP method and request body
     */
    validateRequestFields(fieldsToHighlight, method, body) {
        const issues = [];
        const validFields = [];
        const requestFields = fieldsToHighlight.request || [];
        
        // Always valid fields
        const alwaysValid = ['url', 'method', 'headers'];
        
        // Get available fields from request body
        let availableFields = [...alwaysValid];
        if (body && typeof body === 'object') {
            const bodyFields = this.extractFieldNames(body);
            availableFields = [...availableFields, ...bodyFields];
        }
        
        // Validate each request field
        requestFields.forEach(field => {
            const fieldExists = availableFields.some(available => 
                available === field || available.endsWith(`.${field}`)
            );
            
            if (fieldExists || alwaysValid.includes(field)) {
                validFields.push(field);
            } else {
                const suggestions = this.findSimilarFields(field, availableFields);
                issues.push({
                    field: field,
                    type: 'request',
                    issue: 'Field does not exist in request',
                    suggestions: suggestions
                });
            }
        });
        
        return { issues, validFields };
    }

    /**
     * Validate response fields against actual API response
     */
    validateResponseFields(fieldsToHighlight, responseData) {
        const issues = [];
        const validFields = [];
        const responseFields = fieldsToHighlight.response || [];
        
        // Extract all available fields from response
        const availableFields = this.extractFieldNames(responseData);
        
        // Add common response meta fields
        availableFields.push('status', 'statusText', 'headers', 'data');
        
        // Validate each response field
        responseFields.forEach(field => {
            const fieldExists = availableFields.some(available => 
                available === field || available.endsWith(`.${field}`)
            );
            
            if (fieldExists) {
                validFields.push(field);
            } else {
                const suggestions = this.findSimilarFields(field, availableFields);
                issues.push({
                    field: field,
                    type: 'response',
                    issue: 'Field does not exist in API response',
                    suggestions: suggestions
                });
            }
        });
        
        return { issues, validFields };
    }

    /**
     * Main validation function - validates both request and response fields
     */
    async validate(config, responseData = null) {
        console.log(chalk.blue('🔍 Validating field names...'));
        
        const validationResult = {
            valid: true,
            issues: [],
            correctedFields: {
                request: config.fieldsToHighlight?.request || [],
                response: config.fieldsToHighlight?.response || []
            },
            warnings: []
        };
        
        // Validate request fields
        if (config.fieldsToHighlight?.request?.length > 0) {
            const requestValidation = this.validateRequestFields(
                config.fieldsToHighlight,
                config.method,
                config.body
            );
            
            if (requestValidation.issues.length > 0) {
                validationResult.valid = false;
                validationResult.issues.push(...requestValidation.issues);
                validationResult.correctedFields.request = requestValidation.validFields;
                
                console.log(chalk.yellow(`⚠️  Found ${requestValidation.issues.length} invalid request field(s)`));
                requestValidation.issues.forEach(issue => {
                    console.log(chalk.yellow(`   - "${issue.field}": ${issue.issue}`));
                    if (issue.suggestions.length > 0) {
                        console.log(chalk.cyan(`     Suggestions: ${issue.suggestions.join(', ')}`));
                    }
                });
            } else {
                console.log(chalk.green(`✓ All request fields are valid`));
            }
        }
        
        // Validate response fields (only if response data is provided)
        if (responseData && config.fieldsToHighlight?.response?.length > 0) {
            const responseValidation = this.validateResponseFields(
                config.fieldsToHighlight,
                responseData
            );
            
            if (responseValidation.issues.length > 0) {
                validationResult.valid = false;
                validationResult.issues.push(...responseValidation.issues);
                validationResult.correctedFields.response = responseValidation.validFields;
                
                console.log(chalk.yellow(`⚠️  Found ${responseValidation.issues.length} invalid response field(s)`));
                responseValidation.issues.forEach(issue => {
                    console.log(chalk.yellow(`   - "${issue.field}": ${issue.issue}`));
                    if (issue.suggestions.length > 0) {
                        console.log(chalk.cyan(`     Suggestions: ${issue.suggestions.join(', ')}`));
                    }
                });
            } else {
                console.log(chalk.green(`✓ All response fields are valid`));
            }
        }
        
        // Generate warnings
        if (validationResult.issues.length > 0) {
            const removedCount = validationResult.issues.length;
            const keptRequestCount = validationResult.correctedFields.request.length;
            const keptResponseCount = validationResult.correctedFields.response.length;
            
            validationResult.warnings.push(
                `Removed ${removedCount} invalid field(s) from highlighting`
            );
            validationResult.warnings.push(
                `Proceeding with ${keptRequestCount} request field(s) and ${keptResponseCount} response field(s)`
            );
        }
        
        return validationResult;
    }

    /**
     * Format validation results for user display
     */
    formatValidationMessage(validationResult) {
        if (validationResult.valid && validationResult.issues.length === 0) {
            return {
                success: true,
                message: 'All fields validated successfully ✓'
            };
        }
        
        let message = '⚠️ Field Validation Issues Found:\n\n';
        
        validationResult.issues.forEach((issue, index) => {
            message += `${index + 1}. Field "${issue.field}" (${issue.type}):\n`;
            message += `   Issue: ${issue.issue}\n`;
            if (issue.suggestions.length > 0) {
                message += `   Suggestions: ${issue.suggestions.join(', ')}\n`;
            }
            message += '\n';
        });
        
        if (validationResult.warnings.length > 0) {
            message += 'Actions Taken:\n';
            validationResult.warnings.forEach(warning => {
                message += `• ${warning}\n`;
            });
        }
        
        return {
            success: false,
            message: message,
            correctedFields: validationResult.correctedFields
        };
    }
}

module.exports = ValidationAgent;
