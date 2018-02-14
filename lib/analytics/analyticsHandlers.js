"use strict";

/**
 * ANALYTICS
 * Sends tracking events.
 *
 * REQUIREMENTS:
 * 1) ANALYTICS_PROVIDER set as an environment variable
 *    default: e.analyticsProvider.VOICELABS
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

let provider = null,
    incomingLogging = null,
    outgoingLogging = null;

const initProvider = () => {
    if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT ) {
        const config = {
             debug: false //utils.debugEnabled()
        };

        provider = require( "dashbot" )( process.env.ANALYTICS_TOKEN, config ).alexa;
    } else  {
        provider = require( "voicelabs" )( process.env.ANALYTICS_TOKEN );
    }
};

const analyticsHandlers = {
    "initProvider": initProvider,

    /**
     * Sends tracking event when request is received.
     *
     * @param event
     * @param cb
     */
    "sendRequestTracking": function( event, cb ) {
        cb = utils.errorCheckCallback( cb );

        if ( provider && event && analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT ) {
            utils.log.debug( "Dashbot Request Tracking" );

            incomingLogging = provider.logIncoming( event, null );

            cb();
        } else {
            cb();
        }
    },

    /**
     * Sends tracking event before response is sent.
     *
     * @param data
     * @param cb
     */
    "sendResponseTracking": function( data, options, cb ) {
        data = data || {};

        cb = utils.errorCheckCallback( cb );

        const requestType = utils.get( "event.request.type", this, "" ),
            metadata = {
                state: utils.get( "handler.state", this, "" ), // handler mode

                slots: null, // slot values

                locale: utils.get( "event.request.locale", this, "" )
            };

        let intentName = "";

        if ( requestType === c.requestType.launchRequest || requestType.indexOf( c.requestType.audioPlayer ) === 0 || requestType.indexOf( c.requestType.playbackController ) === 0 ) {
            intentName = requestType;
        } else if ( requestType === c.requestType.sessionEndedRequest ) {
            intentName = c.SESSION_END;
        } else if ( requestType == c.requestType.intentRequest && this.event.request.intent ) {
            intentName = utils.get( "event.request.intent.name", this, "" );

            metadata[ "slots" ] = utils.get( "event.request.intent.slots", this, {} );
        }

        if ( analyticsUtils.getProvider() === e.analyticsProvider.VOICELAB && analyticsUtils.isTrackableRequest( this.event ) ) {
            provider.track( this.event.session, intentName, metadata, utils.get( "speech.output", data, "" ), ( error, response ) => {
                if ( !error ) {
                    console.log( "[Analytics Sent] -> " + ( process.env.ANALYTICS_TOKEN || "" ) );
                }

                cb();
            } );
        } else if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT ) {
            utils.log.debug( "Dashbot Response Tracking" );

            let responseObj = Object.assign( {}, utils.get( "_responseObject", this.response, {} ) );

            // add outgoing intent if present
            const outgoingIntent = analyticsUtils.buildOutgoingIntent( options );

            if ( outgoingIntent ) {
                //TODO: switch to use provider.setOutgoingIntent()
                responseObj[ "intent" ] = outgoingIntent;
            }

            outgoingLogging = provider.logOutgoing( this.event, responseObj );

            Promise.all( [ incomingLogging, outgoingLogging ] );

            cb();
        } else {
            cb();
        }
    },

    "sendEvent": function( event, trackingEvent, trackingParams, cb ) {
        cb = utils.errorCheckCallback( cb );

        if ( analyticsUtils.getProvider() === e.analyticsProvider.VOICELAB &&  analyticsUtils.isTrackableRequest( event ) && trackingEvent ) {
            provider.track( event.session, trackingEvent, trackingParams || null, null, ( error, response ) => {
                if ( !error ) {
                    utils.log.debug( "[Analytics Sent] -> " + ( process.env.ANALYTICS_TOKEN || "" ) + " - " + trackingEvent );
                }

                cb( error, response );
            } );
        } else if ( analyticsUtils.getProvider() === e.analyticsProvider.DASHBOT && trackingEvent ) {
            utils.log.debug( "[sendEvent] --> " + trackingEvent + " - " + JSON.stringify( trackingParams ) );

            dashbotEventService.send( event, trackingEvent, trackingParams, cb );
        } else {
            cb( "Not sent", null);
        }
    },

    "sendSponsorEvent": function( event, campaignId, adLabel, cb ) {
        analyticsHandlers.sendEvent( event, "SponsorPlayedEvent", { campaignId: campaignId, label: adLabel }, cb );
    }
};

initProvider();

module.exports = analyticsHandlers;
