"use strict";

/**
 * ERROR RESPONSES
 *
 */

const errors = {
    code: {
        BAD_REQUEST: 400,
        FORBIDDEN: 403,
        NOT_ACCEPTABLE: 406,
        OK: 200,
        SERVICE_UNAVAILABLE: 503,
        UNAUTHORIZED: 401
    },

    msg: {
        CONTINUE: "Would you like to continue?",
        DATA_MISSING: "Data Missing",
        EMAIL_HTTP_SEND_ERROR: "HTTP Send Email Error",
        EMAIL_SEND_ERROR: "Send Email Error",
        HTTP_ERROR: "HTTP Error",
        NOT_AUTHORIZED: "Not Authorized",
        NOT_LINKED: "Account not linked",
        PROFILE_HTTP_SEND_ERROR: "HTTP Send Profile Error",
        PROFILE_SEND_ERROR: "Send Profile Error",
        SERVICE_UNAVAILABLE: "Service Unavailable"
    }
};

module.exports = errors;
