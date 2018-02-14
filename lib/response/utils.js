"use strict";

const alexa = require( "alexa-sdk" ),
    e = require( "./enums" ),
    utils = require( "./../utils/utils" );

const makeImage = alexa.utils.ImageUtils.makeImage;

const responseUtils = {
    buildDisplayTemplate: function( data ) {
        let template = null;

        if ( data && data.template && alexa.templateBuilders.hasOwnProperty( data.template + "Builder" ) ) {
            const builder = new alexa.templateBuilders[ data.template + "Builder" ]();

            switch( data.template ) {
                case e.template.BODY_1:
                    builder.setTextContent(
                        utils.get( "text.primary", data, null ),
                        utils.get( "text.secondary", data, null ),
                        utils.get( "text.tertiary", data, null )
                    );
                    break;
                case e.template.BODY_2:
                case e.template.BODY_3:
                case e.template.BODY_6:
                    builder.setImage(
                        makeImage(
                            utils.makeImagePath( utils.get( "image.url", data, null ) ),
                            utils.get( "image.width", data, null ),
                            utils.get( "image.height", data, null ),
                            utils.get( "image.size", data, null ),
                            utils.get( "image.description", data, null )
                        )
                    );

                    builder.setTextContent(
                        utils.get( "text.primary", data, null ),
                        utils.get( "text.secondary", data, null ),
                        utils.get( "text.tertiary", data, null )
                    );
                    break;
                case e.template.BODY_7:
                    builder.setImage(
                        makeImage(
                            utils.makeImagePath( utils.get( "image.url", data, null ) ),
                            utils.get( "image.width", data, null ),
                            utils.get( "image.height", data, null ),
                            utils.get( "image.size", data, null ),
                            utils.get( "image.description", data, null )
                        )
                    );
                    break;
                case e.template.LIST_1:
                case e.template.LIST_2:
                        const items = utils.get( "list", data );

                        if ( items && Array.isArray( items ) ) {
                            const listItemBuilder = new alexa.templateBuilders.ListItemBuilder();

                            for ( let i = 0; i < items.length; i++ ) {
                                let img = null;

                                if ( utils.get( "image.url", items[ i ] ) ) {
                                    img = makeImage(
                                        utils.makeImagePath( utils.get( "image.url", items[ i ], null ) ),
                                        utils.get( "image.width", items[ i ], null ),
                                        utils.get( "image.height", items[ i ], null ),
                                        utils.get( "image.size", items[ i ], null ),
                                        utils.get( "image.description", items[ i ], null )
                                    );
                                }

                                listItemBuilder.addItem(
                                    img,
                                    utils.get( "token", items[ i ] ),
                                    utils.get( "text.primary", items[ i ], null ),
                                    utils.get( "text.secondary", items[ i ], null ),
                                    utils.get( "text.tertiary", items[ i ], null )
                                );
                            }

                            builder.setListItems( listItemBuilder.build() );
                        }
                    break;
            }

            //Back Button
            if ( utils.get( "backButton", data ) === e.visibility.HIDDEN ) {
                builder.setBackButtonBehavior( e.visibility.HIDDEN );
            }

            // Background Image
            const bgImage = utils.get( "backgroundImage", data );
            if ( bgImage ) {
                builder.setBackgroundImage(
                    makeImage(
                        utils.makeImagePath( utils.get( "url", bgImage, null ) ),
                        utils.get( "width", bgImage, null ),
                        utils.get( "height", bgImage, null ),
                        utils.get( "size", bgImage, null ),
                        utils.get( "description", bgImage, null )
                    )
                );
            }

            //Hint
            const hint = utils.get( "hint", data );
            if ( hint ) {
                let hintTxt = hint;

                if ( typeof hintTxt !== "string" ) {
                    hintTxt = utils.get( "text", hint, "" );
                }

                this.response.hint( hintTxt, utils.get( "type", hint ) );
            }

            // Title
            builder.setTitle( utils.get( "title", data, "" ) );

            // Token
            const token = utils.get( "token", data );
            if ( token ) {
                builder.setToken( token );
            }

            template = builder.build();
        }

        return template;
    },

    buildCardImage: function( imgObj ) {
        let updatedImgObj = {};

        if ( imgObj ) {
            updatedImgObj[ e.cardImageUrl.small ] = utils.makeImagePath( utils.get( e.cardImageUrl.small, imgObj, null ) );
            updatedImgObj[ e.cardImageUrl.large ] = utils.makeImagePath( utils.get( e.cardImageUrl.large, imgObj, null ) );
        }

        return updatedImgObj;
    },

    buildSsml: function( data ) {
        data = data || {};

        return {
            output: utils.replaceAudioTags( utils.sanitizeSsml( utils.get( "speech.output", data, "" ) ) ),
            reprompt: utils.replaceAudioTags( utils.sanitizeSsml( utils.get( "speech.reprompt", data, "" ) ) )
        };
    },

    replaceInAll: function( data, mapObj ) {
        return responseUtils.replaceInDisplay( responseUtils.replaceInSpeechAndCard( data, mapObj ), mapObj )
    },

    replaceInDisplay: function( data, mapObj ) {
        if ( utils.get( "display.text.primary.text", data ) ) {
            data.display.text.primary.text = utils.replaceAll( data.display.text.primary.text, mapObj );
        }

        if ( utils.get( "display.text.secondary.text", data ) ) {
            data.display.text.secondary.text = utils.replaceAll( data.display.text.secondary.text, mapObj );
        }

        if ( utils.get( "display.text.tertiary.text", data ) ) {
            data.display.text.tertiary.text = utils.replaceAll( data.display.text.tertiary.text, mapObj );
        }

        return data;
    },

    replaceInSpeechAndCard: function( data, mapObj ) {
        if ( utils.get( "speech.output", data ) ) {
            data.speech.output = utils.replaceAll( data.speech.output, mapObj );
        }

        if ( utils.get( "speech.reprompt", data ) ) {
            data.speech.reprompt = utils.replaceAll( data.speech.reprompt, mapObj );
        }

        if ( utils.get( "card.title", data ) ) {
            data.card.title = utils.replaceAll( data.card.title, mapObj );
        }

        if ( utils.get( "card.output", data ) ) {
            data.card.output = utils.replaceAll( data.card.output, mapObj );
        }

        return data;
    }
};

module.exports = responseUtils;
