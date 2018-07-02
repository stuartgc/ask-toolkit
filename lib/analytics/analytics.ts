"use strict";

import { HandlerInput, RequestInterceptor, ResponseInterceptor } from "ask-sdk";
import { AnalyticsProvider, RequestType } from "./../enums";

import * as analyticsUtils from "./analyticsUtils";
import * as dashbotEventService from "./dashbotEventService";
import * as persistence from "./../persistence/persistence" ;
import * as utils from "./../utils/utils";

/**
 * ANALYTICS
 * Sends tracking events.
 *
 * REQUIREMENTS:
 * 1) ANALYTICS_PROVIDER set as an environment variable
 *    default: AnalyticsProvider.DASHBOT
 * 2) ANALYTICS_TOKEN set as an environment variable
 * 3) Add `analytics.init( event );` to main file
 *    immediately following `const alexa` .
 *
 */

const NOT_SENT = "Dashbot Event Not Sent",
    SESSION_END = "SessionEnd";

let provider = null;

const initProvider = () => {
    if ( analyticsUtils.getProvider() === AnalyticsProvider.VOICELAB ) {
        // Initialize other provider here
    } else  {
        const config = {
            debug: false //utils.debugEnabled()
        };

        provider = require( "dashbot" )( process.env.ANALYTICS_TOKEN, config ).alexa;
    }
};


/**
 * Sends tracking event when request is received.
 *
 * @param event
 */
export class SendRequestTracking implements RequestInterceptor {
    async process( handlerInput: HandlerInput ): Promise {
        const requestAttr: object = handlerInput.attributesManager.getRequestAttributes();

        const notSent: boolean = utils.get( "requestTrackingSent", requestAttr ) !== true;

        if ( notSent && provider && handlerInput && handlerInput.requestEnvelope && analyticsUtils.getProvider() === AnalyticsProvider.DASHBOT ) {
            utils.log.debug( "Dashbot Request Tracking" );

            persistence.setRequestAttributes( handlerInput, {
                requestTrackingSent: true
            } );

            return provider.logIncoming( handlerInput.requestEnvelope, null );
        } else {
            return;
        }
    }
}

/**
 * Sends tracking event before response is sent.
 *
 * @param data
 */
export class SendResponseTracking implements ResponseInterceptor {
    async process( handlerInput: HandlerInput ): Promise {
        const event: object = utils.get( "requestEnvelope", handlerInput, "" ),
            requestAttr: object = handlerInput.attributesManager.getRequestAttributes();

        const notSent: boolean = utils.get( "responseTrackingSent", requestAttr ) !== true;

        const reqType: string = utils.get( "request.type", event, "" ),
            metadata: object = {
                slots: null, // slot values

                locale: utils.get( "request.locale", event, "" )
            };

        let intentName: string = "";

        if ( reqType === RequestType.launchRequest || reqType.indexOf( RequestType.audioPlayer ) === 0 || reqType.indexOf( RequestType.playbackController ) === 0 ) {
            intentName = reqType;
        } else if ( reqType === RequestType.sessionEndedRequest ) {
            intentName = SESSION_END;
        } else if ( reqType == RequestType.intentRequest && utils.get( "request.intent", event, "" ) ) {
            intentName = utils.get( "request.intent.name", event, "" );

            metadata[ "slots" ] = utils.get( "request.intent.slots", event, {} );
        }

        if ( notSent && analyticsUtils.getProvider() === AnalyticsProvider.DASHBOT && analyticsUtils.isTrackableRequest( event ) ) {
            utils.log.debug( "Dashbot Response Tracking" );

            persistence.setRequestAttributes( handlerInput, {
                responseTrackingSent: true
            } );

            const responseObj: object = {
                "version": "1.0",
                "response": handlerInput.responseBuilder.getResponse() || {},
                "sessionAttributes": handlerInput.attributesManager.getSessionAttributes() || {}
            };

            //add outgoing intent if present
            const outgoingIntent = await analyticsUtils.buildOutgoingIntent( handlerInput );

            if ( outgoingIntent ) {
                provider.setOutgoingIntent( outgoingIntent );
            }

            return provider.logOutgoing( event, responseObj );
        } else {
            return;
        }
    }
}


export class Analytics {
    // "initProvider": initProvider;

    async function sendEvent( event: object, trackingEvent, trackingParams ): Promise {
        if ( analyticsUtils.getProvider() === AnalyticsProvider.DASHBOT &&  analyticsUtils.isTrackableRequest( event ) && trackingEvent ) {
            utils.log.debug( "[sendEvent] --> " + trackingEvent + " - " + JSON.stringify( trackingParams ) );

            return dashbotEventService.send( event, trackingEvent, trackingParams );
        } else {
            return Promise.reject( new Error( NOT_SENT ) );
        }
    }

    async function sendSponsorEvent( event, campaignId, adLabel ): Promise {
        return this.sendEvent( event, "SponsorPlayedEvent", { campaignId: campaignId, label: adLabel } );
    }

    "utils": analyticsUtils;
}

initProvider();
