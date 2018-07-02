"use strict";
const Alexa = require("ask-sdk-core"), e = require("./../enums"), utils = require("./../utils/utils");
const makePlainText = new Alexa.PlainTextContentHelper(), makeImage = new Alexa.ImageHelper(), makeRichText = new Alexa.RichTextContentHelper();
const responseUtils = {
    buildDisplayTemplate: (handlerInput, data) => {
        let template = null;
        if (data && data.template) {
            template = {
                type: data.template
            };
            switch (data.template) {
                case e.template.BODY_1:
                    utils.set("textContent", template, responseUtils.buildTextObj(utils.get("text", data)));
                    break;
                case e.template.BODY_2:
                case e.template.BODY_3:
                case e.template.BODY_6:
                    utils.set("image", template, responseUtils.buildImageObj(utils.get("image", data)));
                    utils.set("textContent", template, responseUtils.buildTextObj(utils.get("text", data)));
                    break;
                case e.template.BODY_7:
                    utils.set("image", template, responseUtils.buildImageObj(utils.get("image", data)));
                    break;
                case e.template.LIST_1:
                case e.template.LIST_2:
                    const items = utils.get("list", data), itemList = [];
                    if (items && Array.isArray(items)) {
                        for (let i = 0; i < items.length; i++) {
                            let listItem = {
                                token: utils.get("token", items[i])
                            };
                            if (utils.get("image.url", items[i])) {
                                utils.set("image", listItem, responseUtils.buildImageObj(utils.get("image", items[i])));
                            }
                            utils.set("textContent", listItem, responseUtils.buildTextObj(utils.get("text", data)));
                            itemList.push(listItem);
                        }
                        utils.set("listItems", template, itemList);
                    }
                    break;
            }
            //Back Button
            if (utils.get("backButton", data) === e.visibility.HIDDEN) {
                utils.set("backButton", template, e.visibility.HIDDEN);
            }
            // Background Image
            utils.set("backgroundImage", template, responseUtils.buildImageObj(responseUtils.getRandomItem(utils.get("backgroundImage", data))));
            // Title
            utils.set("title", template, utils.get("title", data, ""));
            // Token
            const token = utils.get("token", data);
            if (token) {
                utils.set("token", template, token);
            }
        }
        return template;
    },
    buildImageObj: (img) => {
        if (img) {
            const description = utils.get("description", img, null), width = utils.get("width", img, null), height = utils.get("height", img, null);
            if (description) {
                makeImage.withDescription(description);
            }
            makeImage.addImageInstance(utils.makeImagePath(utils.get("url", img, null)), utils.get("size", img, null), (width ? parseInt(width) : null), (height ? parseInt(height) : null));
            return makeImage.getImage();
        }
        return null;
    },
    buildSsml: (data) => {
        data = data || {};
        let output = responseUtils.getRandomItem(utils.get("speech.output", data, "")), reprompt = responseUtils.getRandomItem(utils.get("speech.reprompt", data, ""));
        return {
            output: utils.replaceAudioTags(utils.sanitizeSsml(output)),
            reprompt: utils.replaceAudioTags(utils.sanitizeSsml(reprompt))
        };
    },
    buildTextObj: (txt) => {
        if (txt) {
            const primary = utils.get("primary", txt, null), secondary = utils.get("secondary", txt, null), tertiary = utils.get("tertiary", txt, null);
            let textBuilder = makeRichText;
            if (utils.get("type", primary) === e.TEXT_STYLE.PLAIN
                && utils.get("type", secondary) === e.TEXT_STYLE.PLAIN
                && utils.get("type", tertiary) === e.TEXT_STYLE.PLAIN) {
                textBuilder = makePlainText;
            }
            return textBuilder
                .withPrimaryText(utils.get("text", primary, null))
                .withSecondaryText(utils.get("text", secondary, null))
                .withTertiaryText(utils.get("text", tertiary, null))
                .getTextContent();
        }
        return null;
    },
    /**
     * Checks if the item is an array and returns a random element from the array.
     *
     * @param data
     * @return {*}
     */
    getRandomItem: function (data) {
        // check if response obj is an array of items
        if (data && Array.isArray(data)) {
            const randomIndex = utils.randomIndex(data.length);
            data = data[randomIndex];
        }
        return data;
    },
    replaceInAll: (data, mapObj) => {
        return responseUtils.replaceInDisplay(responseUtils.replaceInSpeechAndCard(data, mapObj), mapObj);
    },
    replaceInDisplay: (data, mapObj) => {
        if (utils.get("display.text.primary.text", data)) {
            data.display.text.primary.text = utils.replaceAll(data.display.text.primary.text, mapObj);
        }
        if (utils.get("display.text.secondary.text", data)) {
            data.display.text.secondary.text = utils.replaceAll(data.display.text.secondary.text, mapObj);
        }
        if (utils.get("display.text.tertiary.text", data)) {
            data.display.text.tertiary.text = utils.replaceAll(data.display.text.tertiary.text, mapObj);
        }
        return data;
    },
    replaceInSpeechAndCard: (data, mapObj) => {
        if (utils.get("speech.output", data)) {
            data.speech.output = utils.replaceAll(data.speech.output, mapObj);
        }
        if (utils.get("speech.reprompt", data)) {
            data.speech.reprompt = utils.replaceAll(data.speech.reprompt, mapObj);
        }
        if (utils.get("card.title", data)) {
            data.card.title = utils.replaceAll(data.card.title, mapObj);
        }
        if (utils.get("card.output", data)) {
            data.card.output = utils.replaceAll(data.card.output, mapObj);
        }
        return data;
    }
};
module.exports = responseUtils;