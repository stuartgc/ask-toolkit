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
        OK: 200,
        NOT_FOUND: 404,
        UNAUTHORIZED: 401,
        UNKNOWN: 999
    },

    msg: {
        CONTINUE: "Would you like to continue?",
        IN_LIST: "already in list",
        LIST_NOT_FOUND: "No list with type",
        METADATA_ERROR: "[Metadata Fetch Error]",
        NO_TOKEN: "No Token",
        NOT_AUTHORIZED: "Not Authorized"
    }
};

module.exports = errors;
