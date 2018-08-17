"use strict";

const e = require( "./../enums" ),
    utils = require( "./../utils/utils" );

const analyticsHelper = {
    buildOutgoingIntent: async ( handlerInput ) => {
        const requestAttribs = await handlerInput.attributesManager.getRequestAttributes()

        const outgoingIntent = JSON.parse( utils.get( "outgoingIntent", requestAttribs ) );

        let intent = null;

        if ( outgoingIntent ) {
            intent = {
                name: utils.get( "name", outgoingIntent, "" ),
                inputs: []
            };

            const slots = utils.get( "slots", outgoingIntent );

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

    getProvider: () => {
        if ( process.env.ANALYTICS_PROVIDER === e.analyticsProvider.DASHBOT ) {
            return e.analyticsProvider.DASHBOT;
        } else {
            return e.analyticsProvider.VOICELAB;
        }
    },

    isTrackableRequest: ( event ) => {
        if ( event && event.requestEnvelope ) {
            event = event.requestEnvelope;
        }

        if ( utils.get( "session.user.userId", event, false )  ) {
            return true;
        }

        return false;
    }
};

module.exports = analyticsHelper;
