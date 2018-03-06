"use strict";

/**
 * CONSTANTS
 *
 */

const constants = {
    QUEUE_KEY: "analytics",

    // Request types
    requestType: {
        audioPlayer: "AudioPlayer",
        intentRequest: "IntentRequest",
        launchRequest: "LaunchRequest",
        playbackController: "PlaybackController",
        sessionEndedRequest: "SessionEndedRequest"
    },

    SESSION_END: "SessionEnd",

    // DASHBOT EVENT SERVICE
    dashbot: {
        HOST: "https://tracker.dashbot.io",
        eventApi: {
            PATH: "/track",
            PLATFORM: "alexa",
            TYPE: "event",
            VERSION: "9.4.0-rest"
        }
    }
};

module.exports = constants;
