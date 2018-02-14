"use strict";

/**
 * CONSTANTS
 *
 */
const constants = {
    DEFAULT_LOCALE: "en-US",

    S3_HOST: "https://s3.amazonaws.com/",
    S3_BUCKET: ( process.env.S3_BUCKET + "/" ) || "",
    S3_AUDIO_PATH: "speech/",
    S3_IMAGE_PATH: "images/",

    TIMEZONE_OFFSET: {
      "en-US": -5,
      "en-GB": 1
    }
};

module.exports = constants;
