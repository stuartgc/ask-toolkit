"use strict";

/**
 * LIST_API HANDLERS
 *
 * Handles adding items to the Alexa Shopping and To-do Lists
 *
 */
const analytics = require( "./../analytics/analytics" ),
    c = require( "./../constants" ),
    e = require( "./../enums" ),
    err = require( "./../errors" ),
    responseBuilder = require( "./../response/response" ).builder,
    utils = require( "./../utils/utils" );

/**
 *  Util Methods
 */
const ispApiUtils = function() {
    return {
        getAllEntitledProducts: ( inSkillProductList ) => {
            const entitledProductList = inSkillProductList.filter( record => record.entitled === e.ISP.PRODUCT.ENTITLED.ENTITLED );

            return entitledProductList;
        },

        getAllPurchasableProducts: ( inSkillProductList ) => {
            const entitledProductList = inSkillProductList.filter( record => record.entitled === e.ISP.PRODUCT.PURCHASABLE.PURCHASABLE );

            return entitledProductList;
        },

        getSpeakableListOfProducts: ( entitleProductsList ) => {
            const productNameList = entitleProductsList.map( item => item.name );

            let productListSpeech = productNameList.join( ', ' ); // Generate a single string with comma separated product names

            productListSpeech = productListSpeech.replace( /,([^,]*)$/, ' and $1' ); // Replace last comma with an 'and '

            return productListSpeech;
        },

        /**
         * UTILS
         */
        isEntitled: ( product ) => {
            return isProduct( product ) &&
                product[0].entitled === e.ISP.PRODUCT.ENTITLED.ENTITLED;
        },

        isProduct: ( product ) => {
            return product &&
                product.length > 0;
        },

        isPurchasable: ( product ) => {
            return isProduct( product ) &&
                product[0].entitled === e.ISP.PRODUCT.PURCHASABLE.PURCHASABLE;
        },

        sendError: ( responseCode, msg ) => {
            console.error( "[ISP ERROR] " + (responseCode || "") + ": " + (msg || "") );

            return Promis.reject( new Error( responseCode || err.code.UNKNOWN + ": " + msg || "" ) );
        }
    }
}();

const ispApi = {
    getEntitledProducts: async ( handlerInput ) => {
        const products = await ispApi.getInSkillProducts( handlerInput );

        return ispApiUtils.getAllEntitledProducts( products.inSkillProducts );
    },

    getInSkillProducts: async ( handlerInput ) => {
        const locale = utils.getLocale( handlerInput ),
            ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

        try {
            return ms.getInSkillProducts( locale );
        } catch( error ) {
            console.error( "getInSkillProducts Error", error );

            return ispApiUtils.sendError( err.code.BAD_REQUEST, err.msg.API_ERROR );
        }
    },

    getProductById: ( productId, products ) => {
        return products.inSkillProducts.filter( record => record.productId === productId );
    },

    getProductByName: ( productName, products ) => {
        return products.inSkillProducts.filter(record => record.referenceName === productName);
    },

    getPurchasableProducts: async ( handlerInput ) => {
        const products = await ispApi.getInSkillProducts( handlerInput );

        return ispApiUtils.getAllPurchasableProducts( products.inSkillProducts );
    },

    getSpeakableEntitledProducts: async ( handlerInput ) => {
        return ispApiUtils.getSpeakableListOfProducts( await ispApi.getEntitledProducts( handlerInput ) );
    },

    purchaseByName: async ( handlerInput, productName ) => {
        const products = await ispApi.getInSkillProducts( handlerInput );

        const product = ispApi.getProductByName( productName, products );

        const payload = {
            InSkillProduct: {
                productId: product[ 0 ].productId || null,
            }
        };

        return responseBuilder.sendDirective( handlerInput, e.DIRECTIVE.CONNECTIONS.SEND, e.ISP.DIRECTIVE.NAME.BUY, payload, e.ISP.DIRECTIVE.TOKEN );
    },

    /**
     * Sends a permission card.
     *
     * @param speechOutput
     * @param reprompt
     */
    sendPermissionCard: async ( handlerInput, outputData, options ) => {
        if ( outputData ) {
            try {
                await analytics.sendEvent( handlerInput, EVENTS.SEND_PERMISSION_CARD, { type: EVENTS.TYPE } );
            } catch ( error ) {
                console.error( "List permissions analytics error: ", error );
            }

            return responseBuilder.askForPermissions( handlerInput, outputData, options, c.PERMISSIONS.LIST );
        } else {
            return responseBuilder.ask( handlerInput, {
                speech: {
                    output: err.msg.CONTINUE,
                    reprompt: err.msg.CONTINUE
                }
            } );
        }
    },

    upsellByName: async ( handlerInput, productName, message ) => {
        const products = await ispApi.getInSkillProducts( handlerInput );

        const product = ispApi.getProductByName( productName, products );

        const payload = {
            InSkillProduct: {
                productId: product[ 0 ].productId || null,
            },
            upsellMessage: message
        };

        return responseBuilder.sendDirective( handlerInput, e.DIRECTIVE.CONNECTIONS.SEND, e.ISP.DIRECTIVE.NAME.UPSELL, payload, e.ISP.DIRECTIVE.TOKEN );
    }
};

module.exports = ispApi;
