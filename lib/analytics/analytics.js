"use strict";

/**
 * ANALYTICS
 * Sends tracking events.
 *
 * REQUIREMENTS:
 * 1) ANALYTICS_PROVIDER set as an environment variable
 *    default: e.analyticsProvider.DASHBOT
 * 2) ANALYTICS_TOKEN set as an environment variable
 * 3) Add `analytics.init( event );` to main file
 *    immediately following `const alexa` .
 *
 */
const analyticsUtils = require( "./analyticsUtils" ),
    dashbotEventService = require( "./dashbotEventService" ),
    e = require( "./../enums" ),
    persistence = require( "./../persistence/persistence" ),
    utils = require( "./../utils/utils" );

const NOT_SENT = "Dashbot Event Not Sent",
    SESSION_END = "SessionEnd";

let provider = null;

const initProvider = () => {
    if ( analyticsUtils.getProvider() === e.analyticsProvider.VOICELAB ) {
        // Initialize other provider here
    } else  {
        const config = {
            debug: false //utils.debugEnabled()
        };

        provider = require( "dashbot" )( process.env.ANALYTICS_TOKEN, config ).alexa;
    }
};

const analytics = {
    "initProvider": initProvider,

    /**
     * Sends tracking event when request is received.
     *
     * @param event
     */
    "sendRequestTracking": {
        async process( handlerInput ) {
            const requestAttr = handlerInput.attributesManager.getRequestAttributes();

            const notSent = utils.get( "requestTrackingSent", requestAttr ) !== true;

            if ( notSent && provider && handlerInput && handlerInput.requestEnvelope && analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT ) {
                utils.log.debug( "Dashbot Request Tracking" );

                persistence.setRequestAttributes( handlerInput, {
                    requestTrackingSent: true
                } );

                return provider.logIncoming( handlerInput.requestEnvelope, null );
            } else {
                return;
            }
        }
    },

    /**
     * Sends tracking event before response is sent.
     *
     * @param data
     */
    "sendResponseTracking": {
        async process( handlerInput ) {
            const requestAttr = handlerInput.attributesManager.getRequestAttributes();

            const notSent = utils.get( "responseTrackingSent", requestAttr ) !== true;

            if ( notSent ) {
                const event = utils.get( "requestEnvelope", handlerInput, "" );

                const requestType = utils.get( "request.type", event, "" ),
                    metadata = {
                        slots: null, // slot values

                        locale: utils.get( "request.locale", event, "" )
                    };

                let intentName = "";

                if ( requestType === e.requestType.launchRequest || requestType.indexOf( e.requestType.audioPlayer ) === 0 || requestType.indexOf( e.requestType.playbackController ) === 0 ) {
                    intentName = requestType;
                } else if ( requestType === e.requestType.sessionEndedRequest ) {
                    intentName = SESSION_END;
                } else if ( requestType == e.requestType.intentRequest && utils.get( "request.intent", event, "" ) ) {
                    intentName = utils.get( "request.intent.name", event, "" );

                    metadata[ "slots" ] = utils.get( "request.intent.slots", event, {} );
                }

                if ( notSent && analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT && analyticsUtils.isTrackableRequest( event ) ) {
                    utils.log.debug( "Dashbot Response Tracking" );

                    persistence.setRequestAttributes( handlerInput, {
                        responseTrackingSent: true
                    } );

                    const responseObj = {
                        "version": "1.0",
                        "response": handlerInput.responseBuilder.getResponse() || {},
                        "sessionAttributes": handlerInput.attributesManager.getSessionAttributes() || {}
                    };

                    //add outgoing intent if present
                    const outgoingIntent = await analyticsUtils.buildOutgoingIntent( handlerInput );

                    if ( outgoingIntent ) {
                        utils.set( "intent", responseObj, outgoingIntent );
                    }

                    return provider.logOutgoing( event, responseObj );
                }
            }

            return;
        }
    },

    "sendEvent": async ( handlerInput, trackingEvent, trackingParams ) => {
        if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT &&  analyticsUtils.isTrackableRequest( handlerInput ) && trackingEvent ) {
            utils.log.debug( "[sendEvent] --> " + trackingEvent + " - " + JSON.stringify( trackingParams ) );

            return dashbotEventService.send( handlerInput, trackingEvent, trackingParams );
        } else {
            console.log( "[sendEvent] -- " + NOT_SENT );

            return;
        }
    },

    "sendSponsorEvent": async ( handlerInput, campaignId, adLabel ) => {
        return analyticsHandlers.sendEvent( handlerInput, "SponsorPlayedEvent", { campaignId: campaignId, label: adLabel } );
    },

    "utils": analyticsUtils
};

initProvider();

module.exports = analytics;
