"use strict";

const e = require( "./enums" ),
    utils = require( "./../utils/utils" );

const analyticsHelper = {
    buildOutgoingIntent: function( options ) {
        let intent = null;

        if ( options && options.outgoingIntent ) {
            intent = {
                name: utils.get( "outgoingIntent.name", options, "" ),
                inputs: []
            };

            const slots = utils.get( "outgoingIntent.slots", options );

            if ( slots ) {
                for ( let k in slots ) {
                    intent.inputs.push( {
                        name: utils.get( k + ".name", slots, "" ),
                        value: utils.get( k + ".value", slots, "" )
                    } );
                }
            }
        }

        return intent;
    },

    getProvider: function() {
        if ( process.env.ANALYTICS_PROVIDER === e.analyticsProvider.DASHBOT ) {
            return e.analyticsProvider.DASHBOT;
        } else {
            return e.analyticsProvider.VOICELAB;
        }
    },

    isTrackableRequest: function( event ) {
        if ( utils.get( "session.user.userId", event, false )  ) {
            return true;
        }

        return false;
    }
};

module.exports = analyticsHelper;
