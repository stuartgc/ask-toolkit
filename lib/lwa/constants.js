"use strict";

/**
 * CONSTANTS
 *
 */

const constants = {
    // Attribute keys for storing data across session
    attr: {
        PERSIST: "persist"
    },

    // attributes stored under the persist key
    attrPerm: {
        API_USER: "apiUser"
    },

    API: {
        APP_ID: process.env.API_APP_ID || null,
        HOST: process.env.API_HOST || null,
        PATH: {
            NEW_USER: "/api/v1/consumers/{applicationId}/voice",
            EMAIL_RECIPE: "/api/v1/recipe/{applicationId}/recipe/{contentId}/email/voice"
        }
    },

    AMAZON: {
        API_NA: "https://api.amazon.com",
        PROFILE: "/user/profile"
    }
};

module.exports = constants;
