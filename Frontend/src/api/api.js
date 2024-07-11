const axios = require('axios');

/**
 * This function handles API requests with various parameters and returns the response.
 * @param {Object} options - An object containing parameters for the API request.
 * @param {string} options.method - HTTP method (get, post, put, patch, delete, head, options).
 * @param {string} options.endpoint - API endpoint.
 * @param {string|number} [options.paramId] - Optional parameter for endpoint.
 * @param {Object} [options.queryParams] - Optional query parameters.
 * @param {string} [options.token] - Optional token for authentication.
 * @param {Object} [options.headers] - Optional headers for the request.
 * @param {*} [options.data] - Optional data to send with the request.
 * @param {string} [options.baseUrl] - Optional base URL for the API.
 * @returns {Promise} A Promise that resolves to the response object from the HTTP request.
 */
export const apiResponse = async ({
    method,
    endpoint,
    paramId,
    queryParams,
    token,
    headers,
    data,
    baseUrl,
}) => {
    let queryUrl = '';
    if (baseUrl) {
        queryUrl = `${baseUrl}${endpoint}`;
    } else {
        queryUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mrengineersapi.com'}${endpoint}`;
    }
    let headerObj = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headerObj.Authorization = `Bearer ${token}`;
    }

    if (headers) {
        headerObj = { ...headerObj, ...headers };
    }

    if (paramId !== null && paramId !== undefined && paramId !== '') {
        queryUrl = `${queryUrl}/${paramId}`;
    }

    if (queryParams && Object.keys(queryParams).length !== 0) {
        queryUrl = `${queryUrl}?`;
        for (const key in queryParams) {
            queryUrl = `${queryUrl}${key}=${queryParams[key]}&`;
        }
        queryUrl = queryUrl.substring(0, queryUrl.length - 1);
    }

    const AXIOS_INFORMATION = {
        method,
        url: queryUrl,
        headers: headerObj,
        data,
    };

    const response = await axios(AXIOS_INFORMATION);
    return response;
};





