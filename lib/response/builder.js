"use strict";

/**
 * RESPONSE BUILDERS
 *
 * Check README for usage.
 *
 */

const e = require( "./../enums" ),
    responseUtils = require( "./utils" ),
    utils = require( "./../utils/utils" );


const builder = function() {
    return {
        ask: async ( handlerInput, data, options ) => {
            data = data || {};

            data.speech = responseUtils.buildSsml( data );

            handlerInput.responseBuilder
                .speak( data.speech.output )
                .reprompt( data.speech.reprompt );

            return builder.speechless( handlerInput, data, options );
        },

        tell: async ( handlerInput, data, options  ) => {
            data = data || {};

            data.speech = responseUtils.buildSsml( data );

            handlerInput.responseBuilder.speak( data.speech.output );

            return builder.speechless( handlerInput, data, options );
        },

        speechless: async ( handlerInput, data, options ) => {
            let persistentAttr = await handlerInput.attributesManager.getPersistentAttributes();

            if ( data ) {
                // save repeat text
                if ( options && utils.get( "saveRepeat", options, true ) === false ) {
                    delete persistentAttr[ e.attr.SPEECH_OUTPUT ];

                    delete persistentAttr[ e.attr.SPEECH_REPROMPT ];
                } else {
                    persistentAttr[ e.attr.SPEECH_OUTPUT ] = data.speech.output || null;

                    if ( data.speech.reprompt ) {
                        persistentAttr[ e.attr.SPEECH_REPROMPT ] = data.speech.reprompt || null;
                    } else {
                        delete persistentAttr[ e.attr.SPEECH_REPROMPT ];
                    }
                }

                handlerInput.attributesManager.setPersistentAttributes( persistentAttr );

                if ( data.card && data.card.title && data.card.output ) {
                    const cardImg = utils.get( "card.image", data, null );

                    if ( cardImg ) {
                        handlerInput.responseBuilder.withStandardCard(
                            data.card.title,
                            data.card.output,
                            utils.makeImagePath( utils.get( e.cardImageUrl.small, imgObj, null ) ),
                            utils.makeImagePath( utils.get( e.cardImageUrl.large, imgObj, null ) )
                        )
                    } else {
                        handlerInput.responseBuilder.withSimpleCard(
                            data.card.title,
                            data.card.output
                        )
                    }
                }

                if ( utils.hasDisplayInterface( handlerInput ) ) {
                    const template = responseUtils.buildDisplayTemplate( handlerInput, utils.get( "display", data, null ) );

                    if ( template ) {
                        handlerInput.responseBuilder.addRenderTemplateDirective( template );
                    }

                    //Hint
                    const hint = utils.get( "hint", data );
                    if ( hint ) {
                        handlerInput.responseBuilder.addHintDirective( hint );
                    }
                }
            }

            if ( options ) {
                if ( options.outgoingIntent ) {
                    handlerInput.attributesManager.setRequestAttributes( {
                        outgoingIntent: JSON.stringify( options.outgoingIntent )
                    } );
                }

                if ( options.shouldEndSession === true ) {
                    handlerInput.responseBuilder.withShouldEndSession( true );
                }
            }

            return handlerInput.responseBuilder.getResponse();
        }
    };
}();

module.exports = builder;
