/**
 * Helper function to map API condition data to a usable frontend format
 */
export const mapConditionData = (apiData) => {
    if (!apiData) {
        return { conditions: [], logicalOperator: 'AND', errors: {} };
    }

    let conditions = [];
    let logicalOperator = 'AND';

    // Case 1: Check if conditions are directly in the apiData
    if (apiData.conditions && Array.isArray(apiData.conditions)) {
        conditions = apiData.conditions;
        logicalOperator = apiData.logical_operator || apiData.logicalOperator || 'AND';
    }
    // Case 2: Check if apiData itself is an array of conditions
    else if (Array.isArray(apiData)) {
        conditions = apiData;
    }
    // Case 3: Check if conditions are nested in a 'data' property
    else if (apiData.data && apiData.data.conditions && Array.isArray(apiData.data.conditions)) {
        conditions = apiData.data.conditions;
        logicalOperator = apiData.data.logical_operator || apiData.data.logicalOperator || 'AND';
    }
    // Case 4: Check if this is a campaign object with nested condition data
    else if (apiData.bannerData && apiData.bannerData.conditions) {
        conditions = apiData.bannerData.conditions.conditions || [];
        logicalOperator = apiData.bannerData.conditions.logical_operator ||
            apiData.bannerData.conditions.logicalOperator || 'AND';
    }
    // Case 5: For when the structure is unknown, try to find conditions array
    else {
        for (const key in apiData) {
            if (apiData[key] && apiData[key].conditions && Array.isArray(apiData[key].conditions)) {
                conditions = apiData[key].conditions;
                logicalOperator = apiData[key].logical_operator || apiData[key].logicalOperator || 'AND';
                break;
            }
        }
    }

    if (!conditions || !conditions.length) {
        return { conditions: [], logicalOperator: 'AND', errors: {} };
    }

    const mappedData = {
        conditions: conditions.map(condition => ({
            field: condition.field || '',
            operator: condition.operator || '',
            value: condition.value !== undefined ? condition.value.toString() : '',
            conditions: Array.isArray(condition.conditions)
                ? condition.conditions.map(nestedCondition => ({
                    field: nestedCondition.field || '',
                    operator: nestedCondition.operator || '',
                    value: nestedCondition.value !== undefined ? nestedCondition.value.toString() : '',
                    logicalOperator: nestedCondition.logical_operator || nestedCondition.logicalOperator || 'AND',
                    conditions: []
                }))
                : [],
            logicalOperator: condition.logical_operator || condition.logicalOperator || 'AND'
        })),
        logicalOperator: logicalOperator,
        campaignType: apiData.campaignType || apiData.campaign_type || null,
        errors: {}
    };
    return mappedData;
};

/**
 * Function to prepare conditions data for API submission
 */
export const prepareConditionsForSubmission = (state) => {
    const { conditions, logicalOperator } = state;

    const formattedConditions = Array.isArray(conditions) ? conditions.map(condition => ({
        field: condition.field,
        operator: condition.operator,
        value: condition.value,
        logical_operator: condition.logicalOperator || 'AND',
        conditions: Array.isArray(condition.conditions) ? condition.conditions.map(nestedCondition => ({
            field: nestedCondition.field,
            operator: nestedCondition.operator,
            value: nestedCondition.value,
            logical_operator: nestedCondition.logicalOperator || 'AND'
        })) : []
    })) : [];

    return {
        conditions: formattedConditions,
        logical_operator: logicalOperator || 'AND'
    };
};
