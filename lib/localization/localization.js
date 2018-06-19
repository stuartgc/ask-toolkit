"use strict";

const i18n = require( "i18next" ),
    sprintf = require( "i18next-sprintf-postprocessor" );

let languageString = {};

const localization = function( lang ) {
    languageString = lang;

    this.requestInterceptor = {
        process( handlerInput ) {
            const localizationClient = i18n.use( sprintf ).init( {
                lng: handlerInput.requestEnvelope.request.locale,
                overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
                resources: languageString,
                returnObjects: true
            } );

            const attributes = handlerInput.attributesManager.getRequestAttributes();
            attributes.t = function( ...args ) {
                return localizationClient.t( ...args );
            };
        }
    };

    return this;
};

module.exports = localization;
