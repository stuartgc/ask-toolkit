"use strict";

/**
 * CONSTANTS
 *
 */

const constants = {
    // Attribute keys for storing data across session
    attr: {
        LIST_IDS: "listIds"
    },

    events: {
        SEND_PERMISSION_CARD: "sendPermissionCard",
        TYPE: "listApi"
    },

    itemStatus: {
        ACTIVE: "active",
        COMPLETED: "completed"
    },

    listTypes: {
        TODO: "to-do",
        SHOPPING: "shopping"
    },

    PERMISSIONS: [
        "read::alexa:household:list",
        "write::alexa:household:list"
    ]
};

module.exports = constants;
