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
        METADATA_ERROR: "[Metadata Fetch Error]",
        NO_DATA: "No data",
        NO_TOKEN: "No Token",
        NOT_AUTHORIZED: "Not Authorized",
        DASHBOT_EVENT: {
            API_ERROR: "Dashbot Event API Error",
            HTTP_ERROR: "Dashbot Event HTTP Error"
        },
        LIST_API: {
            IN_LIST: "already in list",
            SHOPPING: {
               NOTHING_TO_ADD: "nothing to add to the shopping list"
            },
            TODO: {
                NOTHING_TO_ADD: "nothing to add to the to-do list"
            }
        },
        KMS: {
            DECRYPT: " decrypt error: ",
            ENCRYPTED_MISSING: "Encrypted missing or not an object"
        }
    }
};

module.exports = errors;
