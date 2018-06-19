"use strict";

/**
 * CONSTANTS
 *
 */
const constants = {
    DEFAULT_LOCALE: "en-US",

    PERMISSIONS: {
        LIST: [
            "read::alexa:household:list",
            "write::alexa:household:list"
        ]
    },

    S3_HOST: "https://s3.amazonaws.com/",
    S3_BUCKET: ( process.env.S3_BUCKET + "/" ) || "",
    S3_AUDIO_PATH: "speech/",
    S3_IMAGE_PATH: "images/",

    TIMEZONE_OFFSET: {
        "en-US": -5,
        "en-GB": 1
    },

    // DASHBOT EVENT SERVICE
    DASHBOT: {
        HOST: "https://tracker.dashbot.io",
        EVENT_API: {
            PATH: "/track",
            PLATFORM: "alexa",
            TYPE: "event",
            VERSION: "9.4.0-rest"
        }
    },

    DYNAMODB: {
        ATTRIBUTES: "mapAttr",
        PARTITION_KEY: "userId",
        TABLE: process.env.DYNAMODB_TABLE || ""
    }
};

module.exports = constants;
