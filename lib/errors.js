"use strict";

/**
 * ERROR RESPONSES
 *
 */

const errors = {
    code: {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        FOUND: 302,
        NOT_ACCEPTABLE: 406,
        NOT_FOUND: 404,
        OK: 200,
        SERVICE_UNAVAILABLE: 503,
        UNAUTHORIZED: 401,
        UNKNOWN: 999
    },

    msg: {
        CONTINUE: "Would you like to continue?",
        IN_LIST: "already in list",
        LIST_NOT_FOUND: "No list with type",
        METADATA_ERROR: "[Metadata Fetch Error]",
        NO_TOKEN: "No Token",
        NOT_AUTHORIZED: "Not Authorized",
        dashbotEvent: {
            API_ERROR: "Dashbot Event API Error",
            HTTP_ERROR: "Dashbot Event HTTP Error"
        }
    }
};

module.exports = errors;
