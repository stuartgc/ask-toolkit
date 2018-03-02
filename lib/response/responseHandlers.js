"use strict";

/**
 * RESPONSE HANDLERS
 *
 * Check README for usage.
 *
 */

const analytics = require( "./../analytics/analytics" ),
    async = require( "async" ),
    e = require( "./enums" ),
    queue = require( "./queue" ),
    responseUtils = require( "./utils" ),
    utils = require( "./../utils/utils" );

const responseHandlers = {
    "::ask": function( data, options ) {
        data = data || {};

        data.speech = responseUtils.buildSsml( data );

        this.response.speak( data.speech.output )
                    .listen( data.speech.reprompt );

        this.emit( "::buildResponse", data, options );
    },

    "::tell": function( data, options ) {
        data = data || {};

        data.speech = responseUtils.buildSsml( data );

        this.response.speak( data.speech.output );

        this.emit( "::buildResponse", data, options );
    },

    "::buildResponse": function( data, options ) {
        if ( data ) {
            if ( options ) {
                //save repeat text
                if ( utils.get( "saveRepeat", options, true ) === false ) {
                    delete this.attributes[ e.attr.SPEECH_OUTPUT ];

                    delete this.attributes[ e.attr.SPEECH_REPROMPT ];
                } else {
                    this.attributes[ e.attr.SPEECH_OUTPUT ] = data.speech.output;

                    if ( data.speech.reprompt ) {
                        this.attributes[ e.attr.SPEECH_REPROMPT ] = data.speech.reprompt;
                    } else {
                        delete this.attributes[ e.attr.SPEECH_REPROMPT ];
                    }
                }
            }

            if ( data.card && data.card.title && data.card.output ) {
                this.response.cardRenderer( data.card.title, data.card.output, responseUtils.buildCardImage( utils.get( "card.image", data, null ) ) );
            }

            //TODO: test for display interface support including version
            if ( utils.getDisplayInterface( this.event ) ) {
                const template = responseUtils.buildDisplayTemplate.call( this, utils.get( "display", data, null ) );

                if ( template ) {
                    this.response.renderTemplate( template );
                }
            }
        }

        this.emit( "::onBeforeResponse", data, options );
    },

    /**
     * Calls methods before emitting a response.
     * 1) lwa.linkUser
     * 2) analytics.handlers.sendResponseTracking
     * 3) emit( "::respond" )
     *
     * @param data
     * @param options
     */
    "::onBeforeResponse": function( data, options ) {
        options = options || {};

        queue.addToBeforeResponse( ( cb ) => {
            if ( utils.get( "track", options, true ) === false ) {
                cb( null, "NotTracked" );
            } else {
                analytics.handlers.sendResponseTracking.call( this, data, options, cb );
            }
        } );

        async.series( queue.getBeforeResponse(), ( err, results ) => {
            this.emit( "::respond", data, options );
        } );
    },

    "::respond": function( data, options ) {
        if ( options ) {
            if ( options.shouldEndSession === null ) {
                this.response.shouldEndSession( options.shouldEndSession );
            }
        }

        this.emit( ":responseReady" );
    }
};

module.exports = responseHandlers;
