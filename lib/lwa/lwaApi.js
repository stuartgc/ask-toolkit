"use strict";

/**
 * LWA_API HANDLERS
 *
 * Handles connecting to and fetching data from Login With Amazon
 *
 */
const analyticsHandlers = require( "./../analytics/analyticsHandlers" ),
    c = require( "./constants" ),
    err = require( "./errors" ),
    request = require( "request" ),
    utils = require( "./../utils/utils" );

/**
 *  Util Methods
 */
const lwaApiUtils = function() {
    return {
        apiKey: null,

        init: function( apiKey ) {
            this.apiKey = null;

            if ( apiKey ) {
                this.apiKey = apiKey;
            }
        },

        fetchProfile: function( authToken, cb ) {
            cb = utils.errorCheckCallback( cb );

            if ( authToken ) {
                const options = {
                    url: c.AMAZON.API_NA + c.AMAZON.PROFILE,
                    qs: {
                        access_token: authToken
                    }
                };

                request.get( options, ( error, response, body ) => {
                    if ( error ) {
                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.HTTP_ERROR );
                    } else if ( response.statusCode === err.code.FORBIDDEN ) {
                        this.sendError( cb, response.statusCode, err.msg.NOT_AUTHORIZED );
                    } else if ( response.statusCode === err.code.OK ) {
                        const profile = JSON.parse( body );

                        cb( null, profile );
                    } else {
                        this.sendError( cb, response.statusCode, error || err.msg.SERVICE_UNAVAILABLE );
                    }
                } );
            } else {
                this.sendError( cb, err.code.UNAUTHORIZED, err.msg.NOT_AUTHORIZED );
            }
        },

        getConsumerId: function( event, cb ) {
            this.fetchProfile( utils.getAuthToken( event ), ( error, profile ) => {
                if ( error ) {
                    cb( error );
                    return;
                }

                this.sendProfile( utils.getUserId( event ), profile, ( error, consumerId ) => {
                    if ( error ) {
                        cb( error );
                        return;
                    }

                    cb( null, consumerId );
                } );
            } );
        },

        updateAndSend: function( event, contentId, consumerId, cb ) {
            this.fetchProfile( utils.getAuthToken( event ), ( error, profile ) => {
                if ( error ) {
                    cb( error );
                    return;
                }

                const bodyData = Object.assign( {}, {
                    consumerId: consumerId,
                    email: utils.get( "email", profile, null ),
                    name: utils.get( "name", profile, null )
                } );

                this.sendEmail( contentId, bodyData, cb );
            } );
        },

        sendProfile: function( alexaUid, profile, cb ) {
            cb = utils.errorCheckCallback( cb );

            if ( this.apiKey && c.API.APP_ID && c.API.HOST && profile ) {
                const options = {
                    url: ( c.API.HOST + c.API.PATH.NEW_USER ).replace( /\{applicationId\}/g, c.API.APP_ID ),
                    qs: {
                        apiKey: this.apiKey
                    },
                    body: {
                        name: utils.get( "name", profile, null ),
                        email: utils.get( "email", profile, null ),
                        alexaUid: alexaUid || null,
                        amazonUid: utils.get( "user_id", profile, null )
                    },
                    json: true
                };


                request.post( options, ( error, response, body ) => {
                    if ( error || utils.get( "statusCode", response ) === err.code.FORBIDDEN ) {
                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.PROFILE_HTTP_SEND_ERROR );
                    } else if ( body.success === false ) {
                        this.sendError( cb, utils.get( "code", body, err.code.BAD_REQUEST ), utils.get( "message", body, err.msg.PROFILE_SEND_ERROR ) )
                    } else {
                        cb( null, utils.get( "data.consumerId", body ) );
                    }
                } );
            } else {
                this.sendError( cb, err.code.FORBIDDEN, err.msg.NOT_AUTHORIZED );
            }
        },

        sendEmail: function( contentId, bodyData, cb ) {
            cb = utils.errorCheckCallback( cb );

            if ( this.apiKey && c.API.APP_ID && c.API.HOST && contentId && bodyData instanceof Object ) {
                const options = {
                    url: ( c.API.HOST + c.API.PATH.EMAIL_RECIPE ).replace( /\{applicationId\}/g, c.API.APP_ID ).replace( /\{contentId\}/g, contentId ),
                    qs: {
                        apiKey: this.apiKey
                    },
                    body: bodyData,
                    json: true
                };
                
                request.post( options , ( error, response, body ) => {
                    if ( error ) {
                        utils.log.debug( "Email Post Error-->" + JSON.stringify( error ) );

                        this.sendError( cb, err.code.BAD_REQUEST, err.msg.EMAIL_HTTP_SEND_ERROR );
                    } else if ( body.success === false  ) {
                        utils.log.debug( "Email API Error-->" + utils.get( "code", body, err.code.BAD_REQUEST ) + " - " + utils.get( "message", body, err.msg.EMAIL_SEND_ERROR ) );

                        this.sendError( cb, utils.get( "code", body, err.code.BAD_REQUEST ), utils.get( "message", body, err.msg.EMAIL_SEND_ERROR ) )
                    } else {
                        cb( null, body );
                    }
                } );
            } else {
                this.sendError( cb, err.code.FORBIDDEN, err.msg.NOT_AUTHORIZED );
            }
        },

        /**
         * UTILS
         */
        sendError: function( cb, responseCode, msg ) {
            console.log( "[LWA ERROR] " + ( responseCode || "" ) + ": " + ( msg || "" ) );

            utils.errorCheckCallback( cb );

            cb( {
                code: responseCode || 999,
                msg: msg || ""
            }, null );
        }
    }
}();

const lwaApi = {
    init: function( event ) {
        lwaApiUtils.init( event );
    },

    linkUser: function( cb ) {
        cb = utils.errorCheckCallback( cb );

        const uid = utils.get( c.attr.PERSIST + "." + c.attrPerm.API_USER, this.attributes );

        if ( uid ) {
            cb( null, uid );
        } else {
            lwaApiUtils.getConsumerId( this.event, ( error, consumerId ) => {
                if ( error ) {
                    cb( error );
                    return;
                }

                //write persistent attribute
                if ( consumerId ) {
                    console.log( "Account Linked" );

                    this.attributes[ c.attr.PERSIST ][ c.attrPerm.API_USER ] = consumerId;
                }

                cb( null, consumerId );
            } );
        }
    },

    /**
     * Fetches profile from Amazon and sends current data along with email request to voiceadmin server.
     *
     * @param path.......the voiceadmin server path
     * @param bodyData...the body of the HTTP request.
     * @param cb
     */
    sendEmailWithUpdate: function( contentId, cb ) {
        cb = utils.errorCheckCallback( cb );

        const consumerId = utils.get( c.attr.PERSIST + "." + c.attrPerm.API_USER, this.attributes );

        console.log( "consumerid: " + consumerId );

        if ( !consumerId ) {
            lwaApiUtils.getConsumerId( this.event, ( error, cId ) => {
                if ( error ) {
                    cb( error );
                    return;
                }

                //write persistent attribute
                if ( cId ) {
                    console.log( "Account Linked" );

                    // this.attributes[ c.attr.PERSIST ][ c.attrPerm.API_USER ] = cId;

                    utils.set( c.attr.PERSIST + "." + c.attrPerm.API_USER, this.attributes, cId );

                    //TODO: clean up extra call to fetch profile
                    lwaApiUtils.updateAndSend( this.event, contentId, cId, cb );
                } else {
                    lwaApiUtils.sendError( cb, err.code.BAD_REQUEST, err.msg.NOT_LINKED );
                }

                cb( null, consumerId );
            } );
        } else if ( !contentId ) {
            lwaApiUtils.sendError( cb, err.code.NOT_ACCEPTABLE, err.msg.DATA_MISSING );
        } else {
            lwaApiUtils.updateAndSend( this.event, contentId, consumerId, cb );
        }
    },

    sendLinkAccountCard: function( speechOutput, reprompt ) {
        if ( speechOutput ) {
            analyticsHandlers.sendEvent( this.event, "SendLinkAccountCard", { state: utils.get( "handler.state", this, "" ) }, () => {
                if ( reprompt ) {
                    this.emit( ":askWithLinkAccountCard", speechOutput, reprompt );
                } else {
                    this.emit( ":tellWithLinkAccountCard", speechOutput );
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

module.exports.methods = lwaApi;
module.exports.utils = lwaApiUtils;
