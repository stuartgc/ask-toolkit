"use strict";

/**
 * ENUMS
 *
 */

// Attribute keys for storing data across session
export enum Attr {
    LIST_IDS = "listIds",
    SPEECH_OUTPUT = "speechOutput",
    SPEECH_REPROMPT = "speechReprompt"
}

export enum Protocol {
    HTTP = "http://",
    HTTPS = "https://"
}

// Request types
export enum RequestType {
    audioPlayer = "AudioPlayer",
    intentRequest = "IntentRequest",
    launchRequest = "LaunchRequest",
    playbackController = "PlaybackController",
    sessionEndedRequest = "SessionEndedRequest"
}

/*******************
 **** ANALYTICS ****
 *******************/
export enum AnalyticsProvider {
    DASHBOT = "dashbot"
}

/*******************
 ***** RESPONSE ****
 *******************/
/**
 * Card Enums
 */
export enum CardImageUrl {
    small = "smallImageUrl",
    large = "largeImageUrl"
}

/**
 * Display.RenderTemplate Enums
 */
export enum Size {
    X_SMALL = "X_SMALL",
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    X_LARGE = "X_LARGE"
}

export enum TEXT_STYLE {
    PLAIN = "plain",
    RICH = "rich"
}

export enum Template {
    BODY_1 = "BodyTemplate1",
    BODY_2 = "BodyTemplate2",
    BODY_3 = "BodyTemplate3",
    BODY_6 = "BodyTemplate6",
    BODY_7 = "BodyTemplate7",
    LIST_1 = "ListTemplate1",
    LIST_2 = "ListTemplate2"
}

export enum Visibility {
    HIDDEN = "HIDDEN",
    VISIBLE = "VISIBLE"
}

/*******************
 ****** UTILS ******
 *******************/
export enum DISPLAY_VERSION {
    MARKUP = "markupVersion",
    TEMPLATE = "templateVersion",
    VALID = VALID_DISPLAY_VERSION
}

enum VALID_DISPLAY_VERSION {
    MARKUP = "1.0",
    TEMPLATE = "1.0"
}

export enum LogLevels {
    DEBUG = "debug",
    ERROR = "error"
}
