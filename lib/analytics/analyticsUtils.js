"use strict";

const e = require( "./../enums" ),
    utils = require( "./../utils/utils" );

const analyticsHelper = {
    buildOutgoingIntent: async ( handlerInput ) => {
        const requestAttribs = await handlerInput.attributesManager.getRequestAttributes()

        let intent = null;

        if ( requestAttribs && requestAttribs.outgoingIntent ) {
            intent = {
                name: utils.get( "outgoingIntent.name", requestAttribs, "" ),
                inputs: []
            };

            const slots = utils.get( "outgoingIntent.slots", requestAttribs );

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
