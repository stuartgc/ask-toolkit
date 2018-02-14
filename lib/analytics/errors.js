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
        NOT_AUTHORIZED: "Not Authorized",
        dashbotEvent: {
            API_ERROR: "Dashbot Event API Error",
            HTTP_ERROR: "Dashbot Event HTTP Error"
        }
    }
};

module.exports = errors;
