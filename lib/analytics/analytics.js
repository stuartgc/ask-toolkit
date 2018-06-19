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
    c = require( "./constants" ),
    dashbotEventService = require( "./dashbotEventService" ),
    e = require( "./enums" ),
    utils = require( "./../utils/utils" );

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
        process( handlerInput ) {
            if ( provider && event && analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT ) {
                utils.log.debug( "Dashbot Request Tracking" );

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
        process( handlerInput ) {
            const event = utils.get( "requestEnvelope", handlerInput, "" );

            const requestType = utils.get( "request.type", event, "" ),
                metadata = {
                    slots: null, // slot values

                    locale: utils.get( "request.locale", event, "" )
                };

            let intentName = "";

            if ( requestType === c.requestType.launchRequest || requestType.indexOf( c.requestType.audioPlayer ) === 0 || requestType.indexOf( c.requestType.playbackController ) === 0 ) {
                intentName = requestType;
            } else if ( requestType === c.requestType.sessionEndedRequest ) {
                intentName = c.SESSION_END;
            } else if ( requestType == c.requestType.intentRequest && utils.get( "request.intent", event, "" ) ) {
                intentName = utils.get( "request.intent.name", event, "" );

                metadata[ "slots" ] = utils.get( "request.intent.slots", event, {} );
            }

            if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT && analyticsUtils.isTrackableRequest( event ) ) {
                utils.log.debug( "Dashbot Response Tracking" );

                const responseObj = {
                    "version": '1.0',
                    "response": handlerInput.responseBuilder.getResponse() || {},
                    "sessionAttributes": handlerInput.attributesManager.getSessionAttributes() || {}
                };

                // add outgoing intent if present
                const outgoingIntent = analyticsUtils.buildOutgoingIntent( options );

                if ( outgoingIntent ) {
                    //TODO: switch to use provider.setOutgoingIntent()
                    responseObj[ "intent" ] = outgoingIntent;
                }

                return provider.logOutgoing( event, responseObj );
            } else {
                return;
            }

        }
    },

    "sendEvent": function( event, trackingEvent, trackingParams, cb ) {
        cb = utils.errorCheckCallback( cb );

        if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT &&  analyticsUtils.isTrackableRequest( event ) && trackingEvent ) {
            utils.log.debug( "[sendEvent] --> " + trackingEvent + " - " + JSON.stringify( trackingParams ) );

            dashbotEventService.send( event, trackingEvent, trackingParams, cb );
        } else {
            cb( "Not sent", null);
        }
    },

    "sendSponsorEvent": function( event, campaignId, adLabel, cb ) {
        analyticsHandlers.sendEvent( event, "SponsorPlayedEvent", { campaignId: campaignId, label: adLabel }, cb );
    },

    "utils": analyticsUtils
};

initProvider();

module.exports = analytics;
