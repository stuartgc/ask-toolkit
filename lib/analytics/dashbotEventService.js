"use strict"

/**
 * DASHBOT EVENT SERVICE
 *
 */
const c = require( "./../constants" ),
    err = require( "./../errors" ),
    request = require( "request" ),
    utils = require( "./../utils/utils" );

/**
 *  Private Methods
 */
const dashbotUtils = {
    buildEvent: function( event, trackingEvent, trackingParams ) {
        const sessionId = utils.getSessionId( event, null ),
              userId = utils.getUserId( event, null );

        if ( sessionId && trackingEvent && userId ) {
            if ( typeof trackingParams === "string" ) {
                trackingParams = {
                    data: trackingParams
                };
            }

            const extraInfo = Object.assign( {
                sessionId: sessionId
            }, trackingParams || {} );

            return {
                "name": trackingEvent,
                "type": "customEvent",
                "userId": userId,
                "extraInfo": extraInfo
            }
        }

        return null;
    }
};

/**
 *  Public Methods
 */
const dashbotEventService = {
    send: function( event, trackingEvent, trackingParams, cb ) {
        cb = global.utils.errorCheckCallback( cb );

        const options = {
            url: c.dashbot.HOST + c.dashbot.eventApi.PATH,
            body: dashbotUtils.buildEvent( event, trackingEvent, trackingParams ),
            json: true,
            qs: {
                apiKey: process.env.ANALYTICS_TOKEN,
                platform: c.dashbot.eventApi.PLATFORM,
                type: c.dashbot.eventApi.TYPE,
                v: c.dashbot.eventApi.VERSION
            }
        };

        if ( options.qs.apiKey && options.url && options.body ) {
            utils.log.debug( "[dashbotEventService::send] --> " + JSON.stringify( options.body ) );

            request.post( options, ( error, response, body ) => {
                if ( error ) {
                    console.log( "[dashbotEventService::send] " + err.msg.dashbotEvent.HTTP_ERROR );

                    cb( new Error( err.msg.dashbotEvent.HTTP_ERROR ), null );
                    return;
                } else if ( utils.get( "statusCode", response ) !== err.code.OK ) {
                    console.log( "[dashbotEventService::send] " +  err.msg.dashbotEvent.API_ERROR );
                    console.log( JSON.stringify( utils.get( "errors", body, "" ) ) );

                    cb( new Error( err.msg.dashbotEvent.API_ERROR ), null );
                    return;
                } else {
                    cb( null, body );
                }
            } );
        } else {
            cb( new Error( err.msg.NOT_AUTHORIZED ) );
        }
    }
};

module.exports = dashbotEventService;
