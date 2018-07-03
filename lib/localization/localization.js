"use strict";

const i18n = require( "i18next" );

let languageString = {};

const localization = function( lang ) {
    languageString = lang;

    this.requestInterceptor = {
        process( handlerInput ) {
            const localizationClient = i18n.init( {
                interpolation: {
                    escapeValue: false
                },
                lng: handlerInput.requestEnvelope.request.locale,
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
