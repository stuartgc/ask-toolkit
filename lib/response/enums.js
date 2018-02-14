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

    // Request types
    requestType: {
        launchRequest: "LaunchRequest",
        intentRequest: "IntentRequest",
        sessionEndedRequest: "SessionEndedRequest"
    },

    /**
     * Card Enums
     */
    cardImageUrl: {
        small: "smallImageUrl",
        large: "largeImageUrl"
    },

    /**
     * Display.RenderTemplate Enums
     */
    size: {
        X_SMALL: "X_SMALL",
        SMALL: "SMALL",
        MEDIUM: "MEDIUM",
        LARGE: "LARGE",
        X_LARGE: "X_LARGE"
    },

    style: {
        PLAIN: "plain",
        RICH: "rich"
    },

    template: {
        BODY_1: "BodyTemplate1",
        BODY_2: "BodyTemplate2",
        BODY_3: "BodyTemplate3",
        BODY_6: "BodyTemplate6",
        BODY_7: "BodyTemplate7",
        LIST_1: "ListTemplate1",
        LIST_2: "ListTemplate2"
    },

    visibility: {
        HIDDEN: "HIDDEN",
        VISIBLE: "VISIBLE"
    }
};

module.exports = enums;
