"use strict";

/**
 * CONSTANTS
 *
 */

const constants = {

    attr: {
        NOTIFICATION_PERMISSION_ATTRIBUTE: "NOTIFICATION_PERMISSION",
        NOTIFICATION_PERMISSION_REQUEST_COUNT_ATTRIBUTE: "NOTIFICATION_PERMISSION_REQUEST_COUNT",
        NOTIFICATION_PERMISSION_REQUEST_DATE_ATTRIBUTE: "NOTIFICATION_PERMISSION_REQUEST_DATE"
    },

    PERMISSIONS: [
        "write::alexa:devices:all:notifications:standard"
    ],

    AMAZON: {
        NOTIFICATION_PATH: "/v2/notifications",
        AUTH_STRING: "Bearer "
    },

    ANALYTICS: {
        NOTIFICATIONS_ENABLED: "NOTIFICATIONS_ENABLED"
    },

    API: {
        APP_ID: process.env.API_APP_ID || null,
        API_KEY: process.env.API_KEY || null,
        HOST: process.env.API_HOST || null,
        PATH: {
            PERMISSIONS: "api/v1/consumers/{applicationId}/permission/{allow}/voice"
        }
    }
};

module.exports = constants;
