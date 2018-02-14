"use strict";

/**
 * ENUMS
 *
 */

const enums = {
    // Attribute keys for storing data across session
    attr: {
        SPEECH_OUTPUT: "speechOutput",
        SPEECH_REPROMPT: "speechReprompt"
    },

    logLevels: {
        DEBUG: "debug",
        ERROR: "error"
    },

    protocol: {
        HTTP: "http://",
        HTTPS: "https://"
    },

    // Request types
    requestType: {
        audioPlayer: "AudioPlayer",
        intentRequest: "IntentRequest",
        launchRequest: "LaunchRequest",
        playbackController: "PlaybackController",
        sessionEndedRequest: "SessionEndedRequest"
    }
};

module.exports = enums;
