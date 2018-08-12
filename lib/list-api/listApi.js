"use strict";

/**
 * LIST_API HANDLERS
 *
 * Handles adding items to the Alexa Shopping and To-do Lists
 *
 */
const analytics = require( "./../analytics/analytics" ),
    c = require( "./../constants" ),
    err = require( "./../errors" ),
    persistence = require( "./../persistence/persistence" ),
    responseBuilder = require( "./../response/response" ).builder,
    utils = require( "./../utils/utils" );

const EVENTS = {
        SEND_PERMISSION_CARD: "sendPermissionCard",
        TYPE: "listApi"
    },
    ITEM_STATUS = {
        ACTIVE: "active",
        COMPLETED: "completed"
    },
    LIST_METADATA_ATTRIBUTE = "listApiMetadata",
    LIST_IDENTIFIERS = {
        TODO: "-TASK",
        SHOPPING: "-SHOPPING_ITEM"
    };

/**
 *  Util Methods
 */
const listApiUtils = function() {
    return {
        buildItemSet: function( items, list ) {
            if ( utils.isString( items ) ) {
                items = [ items ];
            }

            let itemSet = new Set( global.utils.trimItemsInArray( items ) );

            for ( let item of itemSet ) {
                if ( this.itemInList( item, list ) ) {
                    itemSet.delete( item );
                }
            }

            return itemSet;
        },

        getListId: ( listIdentifier, metadata ) => {
            for ( let i = 0; i < metadata.lists.length; i += 1 ) {
                const decodedListId = Buffer.from( metadata.lists[ i ].listId, "base64" ).toString( "utf8" );

                // The default lists (To-Do and Shopping List) list_id values are base-64 encoded strings with these formats:
                //  <Internal_identifier>-TASK for the to-do list
                //  <Internal_identifier>-SHOPPING_ITEM for the shopping list
                // Developers can base64 decode the list_id value and look for the specified string at the end. This string is constant and agnostic to localization.

                if ( decodedListId.endsWith( listIdentifier ) ) {
                    return metadata.lists[ i ].listId;
                }
            }

            return null;
        },

        /**
         * UTILS
         */
        itemInList: ( item, list ) => {
            if ( item && list && Array.isArray( list.items ) ) {
                return list.items.findIndex( x => x.value === item ) > -1;
            }

            return false;
        },

        sendError: ( responseCode, msg ) => {
            console.error( "[LIST ERROR] " + ( responseCode || "" ) + ": " + ( msg || "" ) );

            return Promis.reject( new Error( responseCode || err.code.UNKNOWN + ": " +  msg || "" ) );
        },

        sendItemsInListError: ( items ) => {
            return Promis.reject( new Error( err.code.FOUND + ": " + err.msg.LIST_API.IN_LIST + " -> " + JSON.stringify( items ) ) );
        }
    }
}();

const listApi = {
    /**
     * Add items to the specified list id
     *
     * @param handlerInput...standard handler object
     * @param listId.........the id of the list
     * @param items..........string or array of items
     * @return {Promise<*>}
     */
    addItems: async ( handlerInput, listId, items ) => {
        const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();

        // get the list from amazon
        const currentList = await listClient.getList( listId, ITEM_STATUS.ACTIVE );

        if ( currentList ) {
            // de-dupe items and then de-dupe against current list
            const itemSet = listApiUtils.buildItemSet( items, currentList );

            if ( itemSet.size < 1 ) {
                return listApiUtils.sendItemsInListError( item );
            } else {
                let resultMap = new Map();

                for ( let item of itemSet ) {
                    try {
                        const result = await listClient.createListItem( listId, {
                            value: item,
                            status: ITEM_STATUS.ACTIVE
                        } );

                        resultMap.set( item, result );
                    } catch( error ) {
                        console.error( "[ListApi::createItem] Error: ", error );

                        if ( error.statusCode === err.code.FORBIDDEN ) {
                            return listApiUtils.sendError( error.statusCode, err.msg.NOT_AUTHORIZED );
                        } else {
                            return listApiUtils.sendError( err.code.BAD_REQUEST, err.msg.METADATA_ERROR + " - " + error.message );
                        }
                    }
                }

                utils.log.debug( "[ListApi::createItems]: Success" );

                return resultMap;
            }
        } else {
            return listApiUtils.sendError( err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
        }
    },

    /**
     * Adds items to the shopping list.
     *
     * @param handlerInput...standard handler object
     * @param items..........string or array of items
     */
    addItemsToShopping: async ( handlerInput, items ) => {
        if ( items ) {
            const metadata = await listApi.getListMetadata( handlerInput );

            const listId = listApiUtils.getListId( LIST_IDENTIFIERS.SHOPPING, metadata );

            return listApi.addItems( handlerInput, listId, items );
        } else {
            return listApiUtils.sendError( null, err.msg.LIST_API.SHOPPING.NOTHING_TO_ADD );
        }
    },

    /**
     * Adds items to the to-do list.
     *
     * @param handlerInput...standard handler object
     * @param items..........string or array of items
     */
    addItemsToToDo: async ( handlerInput, items ) => {
        if ( items ) {
            const metadata = await listApi.getListMetadata( handlerInput );

            const listId = listApiUtils.getListId( LIST_IDENTIFIERS.TODO, metadata );

            return listApi.addItems( handlerInput, listId, items );
        } else {
            return listApiUtils.sendError( null, err.msg.LIST_API.TODO.NOTHING_TO_ADD );
        }
    },

    /**
     * Fetches metadata for all lists from Amazon
     *
     * @param handlerInput...standard handler object
     * @return {Promise<*>}
     */
    getListMetadata: async ( handlerInput ) => {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const metadataAttrib = utils.get( LIST_METADATA_ATTRIBUTE, sessionAttributes );

        if ( metadataAttrib ) {
            return metadataAttrib;
        } else {
            const listClient = handlerInput.serviceClientFactory.getListManagementServiceClient();

            try {
                const listOfLists = await listClient.getListsMetadata();

                if ( listOfLists && listOfLists.lists ) {
                    persistence.updateSessionAttribute( handlerInput, LIST_METADATA_ATTRIBUTE, listOfLists );

                    return listOfLists;
                } else {
                    console.error( "[ListAPI::getListMetadata] ERROR - no permissions" );

                    return listApiUtils.sendError( err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
                }
            } catch( error ) {
                console.error( "[ListAPI::getListMetadata] ERROR", error )

                return Promise.reject( error );
            }
        }
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
            } catch ( error ){
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
    }
};

module.exports = listApi;
