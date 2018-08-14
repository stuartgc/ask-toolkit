"use strict";

/**
 * ENUMS
 *
 */

const enums = {
    // Attribute keys for storing data across session
    attr: {
        LIST_IDS: "listIds",
        SPEECH_OUTPUT: "speechOutput",
        SPEECH_REPROMPT: "speechReprompt"
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
    },

    /*******************
     **** ANALYTICS ****
     *******************/
    analyticsProvider: {
        DASHBOT: "dashbot"
    },

    /*******************
     ******** ISP ******
     *******************/
    ISP: {
        DIRECTIVE: {
            NAME: {
                BUY: "Buy",
                UPSELL: "Upsell"
            },
            TOKEN: "correlationToken"
        },
        PRODUCT: {
            ENTITLED: {
                ENTITLED: "ENTITLED",
                NOT_ENTITLED: "NOT_ENTITLED"
            },
            PURCHASABLE: {
                NOT_PURCHASABLE: "NOT_PURCHASABLE",
                PURCHASABLE: "PURCHASABLE"
            },
            TYPE: {
                ENTITLEMENT: "ENTITLEMENT",
                SUBSCRIPTION: "SUBSCRIPTION"
            }
        }
    },

    purchaseResult: {
        ACCEPTED: "ACCEPTED",
        ALREADY_PURCHASED: "ALREADY_PURCHASED",
        DECLINED: "DECLINED",
        ERROR: "ERROR"
    },

    /*******************
     ***** RESPONSE ****
     *******************/
    DIRECTIVE: {
        CONNECTIONS: {
            SEND: "Connections.SendRequest"
        }
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

    TEXT_STYLE: {
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
    },

    /*******************
     ****** UTILS ******
     *******************/
    DISPLAY_VERSION: {
        MARKUP: "markupVersion",
        TEMPLATE: "templateVersion",
        VALID: {
            MARKUP: "1.0",
            TEMPLATE: "1.0"
        }
    },

    logLevels: {
        DEBUG: "debug",
        ERROR: "error"
    }
};

module.exports = enums;
