"use strict";

/**
 * LIST_API HANDLERS
 *
 * Handles adding items to the Alexa Shopping and To-do Lists
 *
 */
const Alexa = require( "ask-sdk-core" ),
    analytics = require( "./../analytics/analytics" ),
    c = require( "./../constants" ),
    e = require( "./../enums" ),
    err = require( "./../errors" ),
    utils = require( "./../utils/utils" );

const lms = new Alexa.services.ListManagementService();

const EVENTS: {
        SEND_PERMISSION_CARD: "sendPermissionCard",
        TYPE: "listApi"
    },

    ITEM_STATUS: {
        ACTIVE: "active",
        COMPLETED: "completed"
    },

    LIST_TYPES: {
        TODO: "to-do",
        SHOPPING: "shopping"
    };

/**
 *  Util Methods
 */
const listApiUtils = function() {
    return {
        authToken: null,

        scope: null,

        currentListId: null,

        currentList: {},

        itemsToAdd: [],

        initialize: function( scope, listType, cb ) {
            this.scope = scope;

            this.setAuthToken();

            this.itemsToAdd = [];

            cb = utils.errorCheckCallback( cb );

            if ( this.authToken ) {
                if ( this.hasListIds() ) {
                    this.currentListId = this.getListId( listType );

                    cb( true );
                } else {
                    this.fetchlistMetadata( ( success, data ) => {
                        if ( success ) {
                            this.currentListId = this.getListId( listType );
                        } else {
                            listApiUtils.resetApi();
                        }

                        cb( success, data );
                    } );
                }
            } else {
                this.sendError( cb, err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
            }
        },

        addItemsInList: function( cb, success ) {
            const item = this.itemsToAdd.shift();

            if ( item ) {
                this.createItem( item, ( success, data ) => {
                    this.addItemsInList( cb, success );
                } )
            } else {
                cb( success )
            }

        },

        createItem: function( item, cb ) {
            cb = utils.errorCheckCallback( cb );

            item = item.trim();

            if ( this.currentList[ item ] ) {
                this.sendItemsInListError( cb, item );
            } else if ( this.authToken && item && this.currentListId ) {
                lms.createListItem( this.currentListId, {
                    value: item,
                    status: ITEM_STATUS.ACTIVE
                }, this.authToken )
                .then( ( data ) => {
                    utils.log.debug( "[ListApi::createItem]: " + JSON.stringify( data ) );

                    if ( utils.get( "item.value", data ) ) {
                        this.currentList[ data.item.value ] = true;
                    }

                    cb( true, data );
                } )
                .catch( ( error ) => {
                    console.error( "[ListApi::createItem] Error: ", error );

                    if ( error.statusCode === err.code.FORBIDDEN ) {
                        this.sendError( cb, error.statusCode, err.msg.NOT_AUTHORIZED );
                    } else {
                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.METADATA_ERROR + " - " + error.message );
                    }
                } );
            } else {
                this.sendError( cb, err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
            }
        },

        fetchCurrentList: function( cb ) {
            cb = utils.errorCheckCallback( cb );

            //Lets configure and request
            if ( this.authToken && this.currentListId ) {
                lms.getList( this.currentListId, ITEM_STATUS.ACTIVE, this.authToken )
                .then( ( data ) => {
                    utils.log.debug( "[ListApi::fetchCurrentList]: " + JSON.stringify( data ) );

                    if ( data.items ) {
                        this.currentList = this.flattenList( data.items );
                    } else {
                        this.currentList = {};
                    }

                    cb( true, data );
                } )
                .catch( ( error ) => {
                    console.error( "[ListApi::fetchCurrentList] Error: ", error );

                    if ( error.statusCode === err.code.FORBIDDEN ) {
                        this.sendError( cb, error.statusCode, err.msg.NOT_AUTHORIZED );
                    } else if ( error.statusCode === err.code.NOT_FOUND ) {
                        this.sendError( cb, error.statusCode, err.msg.LIST_NOT_FOUND + " - " + this.currentListId );
                    } else {
                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.METADATA_ERROR + " - " + error.message );
                    }
                } );
            } else {
                this.sendError( cb, err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
            }
        },

        fetchlistMetadata: function( cb ) {
            cb = utils.errorCheckCallback( cb );

            //Lets configure and request
            if ( this.authToken ) {
                lms.getListsMetadata( this.authToken )
                .then( ( data ) => {
                    utils.log.debug( "[ListApi::getListMetadata] List retrieved: " + JSON.stringify( data ) );

                    if ( data.lists ) {
                        this.setListIds( data.lists );
                    } else {
                        delete this.scope.attributes[ e.attr.LIST_IDS ];
                    }

                    cb( true, data );
                } )
                .catch( ( error ) => {
                    console.error( "[ListApi::getListMetadata] Error: ", error );

                    if ( error.statusCode === err.code.FORBIDDEN ) {
                        this.sendError( cb, error.statusCode, err.msg.NOT_AUTHORIZED );
                    } else {
                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.METADATA_ERROR + " - " + error.message );
                    }
                } );
            } else {
                this.sendError( cb, err.code.UNAUTHORIZED, err.msg.NO_TOKEN );
            }
        },

        resetApi: function() {
            this.authToken = null;

            this.resetListIds();
        },

        setItemsToAdd: function( items ) {
            if ( !Array.isArray( items ) ) {
                items = items.split( "," )
            }

            const itemsArr = this.getUniques( global.utils.trimItemsInArray( items ) );

            listApiUtils.itemsToAdd = itemsArr;

            return;
        },

        /**
         *  LIST IDS
         */
        hasListIds: function() {
            if ( this.scope.attributes[ e.attr.LIST_IDS ] ) {
                if ( utils.get( LIST_TYPES.TODO, this.scope.attributes[ e.attr.LIST_IDS ] ) &&  utils.get( LIST_TYPES.SHOPPING, this.scope.attributes[ e.attr.LIST_IDS ] ) ) {
                    return true;
                }
            }

            return false;
        },

        getListId: function( listType ) {
            let listId = utils.get( listType, this.scope.attributes[ e.attr.LIST_IDS ] );

            if ( !listId ) {
                listId = utils.get( LIST_TYPES.SHOPPING, this.scope.attributes[ e.attr.LIST_IDS ] );
            }

            return listId;
        },

        resetListIds: function() {
           delete this.scope.attributes[ e.attr.LIST_IDS ];
        },

        setListIds: function( idList ) {
            this.scope.attributes[ e.attr.LIST_IDS ] = this.scope.attributes[ e.attr.LIST_IDS ] || {};

            for ( let i = 0; i < idList.length; i++ ) {
                if ( idList[ i ].name.indexOf( LIST_TYPES.TODO ) > -1 ) {
                    this.scope.attributes[ e.attr.LIST_IDS ][ LIST_TYPES.TODO ] = idList[ i ].listId;
                } else if ( idList[ i ].name.indexOf( LIST_TYPES.SHOPPING ) > -1 ) {
                    this.scope.attributes[ e.attr.LIST_IDS ][ LIST_TYPES.SHOPPING ] = idList[ i ].listId;
                }
            }
        },

        /**
         * SESSION UTILS
         */
        setAuthToken: function() {
            this.authToken = null;

            if ( this.scope.event ) {
                this.authToken = utils.get( "session.user.permissions.consentToken", this.scope.event, null );
            }

            return;
        },

        /**
         * UTILS
         */

        flattenList: function( arr ) {
            let flatOne = {};

            if ( Array.isArray( arr ) ) {
                for ( let i = 0; i < arr.length; i++ ) {
                    flatOne[ arr[ i ].value ] = true;
                }
            }

            return flatOne;
        },

        getUniques: function( itemsArr ) {
            if ( this.currentList && Array.isArray( itemsArr ) ) {
                let uniques = [];

                for ( let i = 0; i < itemsArr.length; i++ ) {
                    if ( this.currentList[ itemsArr[ i ] ] !== true ) {
                        uniques.push( itemsArr[ i ] )
                    }
                }

                return uniques;
            }

            return itemsArr;
        },

        sendError: function( cb, responseCode, msg ) {
            console.log( "[LIST ERROR] " + ( responseCode || "" ) + ": " + ( msg || "" ) );

            utils.errorCheckCallback( cb );

            cb( false, {
                code: responseCode || err.code.UNKNOWN,
                msg: msg || ""
            } );
        },

        sendItemsInListError: function( cb, items ) {
            this.sendError( cb, err.code.FOUND, err.msg.IN_LIST + " -> " + JSON.stringify( items ) );
        }
    }
}();

const listApi = {
    /**
     * Adds list of items to the specified list.
     *
     * @param listType...type of list (LIST_TYPES)
     * @param items......array or comma separated list of items
     * @param cb.........callback( success, data )
     */
    addItems: function( listType, items, cb ) {
        //TODO: switch to promises
        cb = utils.errorCheckCallback( cb );

        if ( items ) {
            listApiUtils.initialize( this, listType, ( success, data ) => {
                if ( success && listApiUtils.currentListId ) {
                    listApiUtils.fetchCurrentList( ( success, data ) => {
                        if ( success ) {
                            listApiUtils.setItemsToAdd( items );

                            if ( listApiUtils.itemsToAdd.length === 0 ) {
                                listApiUtils.sendItemsInListError( cb, items );
                            } else {
                                listApiUtils.addItemsInList( cb, false );
                            }
                        } else {
                            cb( false );
                        }
                    } );
                } else {
                    cb( false, data );
                }
            } );

        }
    },

    /**
     * Adds single item to the specified list.
     *
     * @param listType...type of list (LIST_TYPES)
     * @param item.......item string
     * @param cb.........callback( success, data )
     */
    addItem: function( listType, item, cb ) {
        cb = utils.errorCheckCallback( cb );

        if ( item ) {
            listApiUtils.initialize( this, listType, ( success, data ) => {
                if ( success ) {
                    listApiUtils.fetchCurrentList( ( success, data ) => {
                        if ( success ) {
                            listApiUtils.createItem( item, cb );
                        } else {
                            cb( false );
                        }
                    } );
                } else {
                    cb( success, data );
                }
            } );
        } else {
            cb( false );
        }
    },

    getListMetadata: function( cb ) {
        cb = utils.errorCheckCallback( cb );

        listApiUtils.fetchlistMetadata( ( success, data ) => {
            if ( success && data.lists ) {
                listApiUtils.setListIds( data.lists );
            }

            cb( success, data );
        } );
    },
    
    sendPermissionCard: function( speechOutput, reprompt ) {
        if ( speechOutput ) {
            analytics.sendEvent( this.event, EVENTS.SEND_PERMISSION_CARD, { type: EVENTS.TYPE, state: utils.get( "handler.state", this, "" ) } )
                .finally( () => {
                    if ( reprompt ) {
                        this.emit( ":askWithLinkAccountCard", speechOutput, reprompt, c.PERMISSIONS.LIST );
                    } else {
                        this.emit( ":tellWithPermissionCard", speechOutput, c.PERMISSIONS.LIST );
                    }
                } );
        } else {
            this.emit( "::ask", {
                speech: {
                    output: err.msg.CONTINUE,
                    reprompt: err.msg.CONTINUE
                }
            } );
        }
    }
};

module.exports = listApi;
