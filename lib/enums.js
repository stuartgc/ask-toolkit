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
    
    ENVIRONMENTS: {
        LOCAL: "local",
        STAGE: "stage",
        PRODUCTION: "production"
    },

    protocol: {
        HTTP: "http://",
        HTTPS: "https://"
    },

    // Request types
    requestType: {
        APL_EVENT: "Alexa.Presentation.APL.UserEvent",
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
                CANCEL: "Cancel",
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
                CONSUMABLE: "CONSUMABLE",
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

    VIEWPORT_PROFILE: {
        HUB_ROUND_SMALL: "HUB-ROUND-SMALL",
        HUB_LANDSCAPE_MEDIUM: "HUB-LANDSCAPE-MEDIUM",
        HUB_LANDSCAPE_LARGE: "HUB-LANDSCAPE-LARGE",
        MOBILE_LANDSCAPE_MEDIUM: "MOBILE-LANDSCAPE-MEDIUM",
        MOBILE_LANDSCAPE_SMALL: "MOBILE-LANDSCAPE-SMALL",
        MOBILE_PORTRAIT_MEDIUM: "MOBILE-PORTRAIT-MEDIUM",
        MOBILE_PORTRAIT_SMALL: "MOBILE-PORTRAIT-SMALL",
        TV_LANDSCAPE_MEDIUM: "TV-LANDSCAPE-MEDIUM",
        TV_LANDSCAPE_XLARGE: "TV-LANDSCAPE-XLARGE",
        TV_PORTRAIT_MEDIUM: "TV-PORTRAIT-MEDIUM",
        UNKNOWN: "UNKNOWN-VIEWPORT-PROFILE"
    },

    visibility: {
        HIDDEN: "HIDDEN",
        VISIBLE: "VISIBLE"
    },

    /*******************
     ****** UTILS ******
     *******************/
    INTERFACE: {
        APL: "Alexa.Presentation.APL",
        DISPLAY: "Display"
    },

    APL_VERSION: {
        MAX_VERSION: "runtime.maxVersion",
        VALID: {
            MIN_VERSION: 0.2
        }
    },

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
    },

    RESOLUTION_AUTHORITY: {
        SOURCE: {
            AUTHORITY: "amzn1.er-authority.echo-sdk.",
            CODE: {
                ER_SUCCESS_MATCH: "ER_SUCCESS_MATCH"
            }
        }
    }
};

module.exports = enums;
