"use strict";
/**
 * RESPONSE BUILDERS
 *
 * Check README for usage.
 *
 */
const e = require("./../enums"), persistence = require("./../persistence/persistence"), responseUtils = require("./utils"), utils = require("./../utils/utils");
const builder = function () {
    return {
        ask: async (handlerInput, data, options) => {
            data = data || {};
            data.speech = responseUtils.buildSsml(data);
            handlerInput.responseBuilder
                .speak(data.speech.output)
                .reprompt(data.speech.reprompt);
            return builder.speechless(handlerInput, data, options);
        },
        tell: async (handlerInput, data, options) => {
            data = data || {};
            data.speech = responseUtils.buildSsml(data);
            handlerInput.responseBuilder.speak(data.speech.output)
                .withShouldEndSession(true);
            return builder.speechless(handlerInput, data, options);
        },
        speechless: async (handlerInput, data, options) => {
            let sessionAttributes = await handlerInput.attributesManager.getSessionAttributes();
            if (data) {
                // save repeat text
                if (options && utils.get("saveRepeat", options, true) === false) {
                    delete sessionAttributes[e.attr.SPEECH_OUTPUT];
                    delete sessionAttributes[e.attr.SPEECH_REPROMPT];
                }
                else {
                    sessionAttributes[e.attr.SPEECH_OUTPUT] = data.speech.output || null;
                    if (data.speech.reprompt) {
                        sessionAttributes[e.attr.SPEECH_REPROMPT] = data.speech.reprompt || null;
                    }
                    else {
                        delete sessionAttributes[e.attr.SPEECH_REPROMPT];
                    }
                }
                if (data.card && data.card.title && data.card.output) {
                    const cardImg = utils.get("card.image", data, null);
                    if (cardImg) {
                        handlerInput.responseBuilder.withStandardCard(data.card.title, data.card.output, utils.makeImagePath(utils.get(e.cardImageUrl.small, imgObj, null)), utils.makeImagePath(utils.get(e.cardImageUrl.large, imgObj, null)));
                    }
                    else {
                        handlerInput.responseBuilder.withSimpleCard(data.card.title, data.card.output);
                    }
                }
                if (utils.hasDisplayInterface(handlerInput)) {
                    const template = responseUtils.buildDisplayTemplate(handlerInput, utils.get("display", data, null));
                    if (template) {
                        handlerInput.responseBuilder.addRenderTemplateDirective(template);
                    }
                    //Hint
                    const hint = utils.get("hint", data);
                    if (hint) {
                        handlerInput.responseBuilder.addHintDirective(hint);
                    }
                }
            }
            if (options) {
                if (options.outgoingIntent) {
                    persistence.setRequestAttributes(handlerInput, {
                        outgoingIntent: JSON.stringify(options.outgoingIntent)
                    });
                }
                if (options.shouldEndSession === true) {
                    handlerInput.responseBuilder.withShouldEndSession(true);
                }
            }
            persistence.setSessionAttributes(handlerInput, sessionAttributes);
            return handlerInput.responseBuilder.getResponse();
        }
    };
}();
module.exports = builder;
