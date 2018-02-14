"use strict";

/**
 * NOTIFICATIONS
 *
 */

const c = require( "./constants" ),
    request = require( "request" ),
    moment = require( "moment"),
    utils = require( "./../utils/utils" ),
    analytics = require( "./../analytics/analytics" ).handlers;

/**
 *  Util Methods
 */
const notificationManager = function() {
    return {
        didInitialize: false,

        alexaUid: null,

        apiAccessToken: null,

        apiEndpoint: null,

        initialize: function( scope, callback ) {
            callback = utils.errorCheckCallback( callback );

            // proceed with initialization
            this.setAlexaUid( scope );

            this.setApiAccessToken( scope );

            this.setApiEndpoint( scope );

            if ( this.apiAccessToken && this.apiEndpoint ){
                // verify apiAccessToken by making a request to fetch notifications
                this.fetchNotifications( function( success, data ) {
                    if ( success ){
                        this.didInitialize = true;
                    }

                    callback( success );
                }.bind( this ) );
            } else {
                this.sendError( callback, 403, "[Initialize - Missing apiAccessToken and/or apiEndpoint]" );
            }
        },

        sendNotification: function( notification, callback ){
            callback = utils.errorCheckCallback( callback );

            if ( this.didInitialize === false ){
                return this.sendError( callback, 403, "[Send Notification - Notifications are not initialized]" );
            }

            // set notification expiry time to 2 days in the future
            let expiryTime = moment( new Date() ).add( 2, "days" ).toDate();

            let content = {
                "displayInfo": {
                  "content": [
                      {
                          "locale": "en-US",
                          "toast" : {
                              "primaryText": notification.display.primaryText
                          },
                          "title": notification.display.title,
                          "bodyItems": [
                              {
                                  "primaryText": notification.display.primaryText
                              }
                          ]
                      }
                  ]
                },
                "referenceId": notification.referenceId,
                "expiryTime": expiryTime,
                "spokenInfo": {
                    "content": [
                        {
                            "locale": "en-US",
                            "text": notification.message.text,
                            "ssml": notification.message.ssml
                        }
                    ]
                }
            };

            let options = {
                url: this.apiEndpoint + c.AMAZON.NOTIFICATION_PATH,
                method: "POST",
                headers: {
                    "Authorization": c.AMAZON.AUTH_STRING + this.apiAccessToken,
                    "Content-Type": "application/json"
                },
                json: content
            };

            request( options, function( error, response, body ) {
                if ( error || response.statusCode === 403 ) {
                    this.sendError( callback, response.statusCode, "[Send Notification - Not Authorized]" );
                } else if ( response.statusCode === 400 ) {
                    this.sendError( callback, response.statusCode, body.message + " - " + JSON.stringify( body.details ) );
                } else {
                    callback( true, body );
                }
            }.bind( this ) );
        },

        fetchNotifications: function( callback ) {
            callback = utils.errorCheckCallback( callback );

            if ( this.apiAccessToken && this.apiEndpoint ) {
                request( {
                    url: this.apiEndpoint + c.AMAZON.NOTIFICATION_PATH,
                    method: "GET",
                    headers: {
                        "Authorization": c.AMAZON.AUTH_STRING + this.apiAccessToken,
                        "Content-Type": "application/json"
                    }
                }, function( error, response, body ) {
                    if ( response.statusCode === 403 ) {
                        this.sendError( callback, response.statusCode, "[Fetch Notifications - Not Authorized]" );
                    } else {
                        console.log( response.statusCode, body );

                        callback( true, body );
                    }
                }.bind( this ) );
            } else {
                this.sendError( callback, 403, "[Fetch Notifications - Missing apiAccessToken or apiEndpoint]" );
            }
        },

        postUserPermissionToServer: function( permission, callback ){
            if ( c.API.API_KEY && c.API.APP_ID && c.API.HOST ) {

                let url = c.API.HOST + c.API.PATH.PERMISSIONS;

                url = url.replace( /\{applicationId\}/g, c.API.APP_ID ).replace( /\{allow\}/g, "notifications" );

                const options = {
                    url: url,
                    qs: {
                        apiKey: c.API.API_KEY
                    },
                    body: {
                        apiBaseUrl: this.apiEndpoint,
                        alexaUid: this.alexaUid,
                        setting: "" + permission + ""
                    },
                    json: true
                };

                //console.log( "Posting notification permission: " + JSON.stringify( options ) );

                request.post( options, ( error, response, body ) => {
                    if ( error ) {
                        console.log( JSON.stringify( response ) );
                        this.sendError( callback, "Bad Request" );
                    } else {
                        if ( body.success === false ) {
                            this.sendError( callback, utils.get( "code", body, "[Missing Error Code]" ), utils.get( "message", body, "[postUserPermission Error]" ) );
                        } else {
                            // Success
                            console.log( JSON.stringify( "Notification permission updated successfully" ) );

                            callback( true, null );
                        }
                    }
                } );
            } else {
                this.sendError( callback, 403, "Missing apiKey or appId" );
            }
        },

        /**
         * SESSION UTILS
         */
        setApiAccessToken: function( scope ) {
            this.apiAccessToken = null;

            if ( scope.event && scope.event.context && scope.event.context.System ) {
                this.apiAccessToken = utils.get( "apiAccessToken", scope.event.context.System );
            }
        },

        setApiEndpoint: function( scope ) {
            this.apiEndpoint = null;

            if ( scope.event && scope.event.context && scope.event.context.System ) {
                this.apiEndpoint = utils.get( "apiEndpoint", scope.event.context.System );
            }
        },

        setAlexaUid: function( scope ) {
            this.alexaUid = null;

            if ( scope.event && scope.event.context && scope.event.context.System && scope.event.context.System.user ) {
                this.alexaUid = utils.get( "userId", scope.event.context.System.user );
            }
        },


        sendError: function( callback, responseCode, msg ) {
            console.log( "[NOTIFICATION ERROR] " + ( responseCode || "" ) + ": " + ( msg || "" ) );

            utils.errorCheckCallback( callback );

            callback( false, {
                code: responseCode || 999,
                msg: msg || ""
            } );
        },
    }
}();

const notificationApi = {

    sendNotification: function( notification, callback ) {
        notificationManager.initialize( this, function( success ) {
            if ( success ){
                notificationManager.sendNotification( notification, callback );
            } else {
                callback( false );
            }
        } );
    },

    /**
     * This endpoint queries the notification endpoint to check if notification permission has been granted.
     *
     * @param callback .... the callback returns a permissionGranted parameter
     */
    didUserGrantPermission: function( callback ) {
        notificationManager.initialize( this, function( permissionGranted ){
            let currentPermissionState = this.attributes[ c.attr.NOTIFICATION_PERMISSION_ATTRIBUTE ];

            console.log( "Current Notification permission state: " + currentPermissionState );

            // Check if we need to update notification permission state on Admin Server
            if ( currentPermissionState === undefined || currentPermissionState !== permissionGranted ){
                console.log( "Updating notification state on Admin Server (permission: " + permissionGranted + ")" );

                notificationManager.postUserPermissionToServer( permissionGranted, function( success, error ){
                    if ( success ){
                        this.attributes[ c.attr.NOTIFICATION_PERMISSION_ATTRIBUTE ] = permissionGranted;
                    }

                    if ( permissionGranted ){
                        analytics.sendEvent( this.event, c.ANALYTICS.NOTIFICATIONS_ENABLED, null, function( error, response ){
                            callback( permissionGranted );
                        });
                    } else {
                        callback( permissionGranted );
                    }
                }.bind( this ) );
            } else {
                callback( permissionGranted );
            }
        }.bind( this ) );
    },

    /**
     * This method check whether it is a good time to ask the user for notification permission
     * There are two checks:
     *  1. if it has been at least 3 days since the last notification permission request
     *  2. if the number of notification permission requests is under 4
     * */
    shouldRequestPermission: function() {
        let notificationPermissionRequestCount = this.attributes[ c.attr.NOTIFICATION_PERMISSION_REQUEST_COUNT_ATTRIBUTE ];

        let notificationPermissionRequestDate = this.attributes[ c.attr.NOTIFICATION_PERMISSION_REQUEST_DATE_ATTRIBUTE ];

        if ( notificationPermissionRequestCount === undefined || notificationPermissionRequestDate === undefined ) {
            // notifications have not yet been requested, so return true
            return true;
        }

        let time = new Date( notificationPermissionRequestDate ).getTime();

        let currentTime = new Date().getTime();

        let REQUEST_TIME_THRESHOLD = 3 * 24 * 60 * 60 * 1000; /* 3 days in ms */

        let MAX_NUMBER_OF_REQUESTS = 4;

        // check if more than REQUEST_TIME_THRESHOLD has elapsed since last permission request
        if ( currentTime - time < REQUEST_TIME_THRESHOLD ){
            // elapsed time is less than REQUEST_TIME_THRESHOLD so return false
            return false;
        }

        // ensure we request notifications a maximum of MAX_NUMBER_OF_REQUESTS
        if ( notificationPermissionRequestCount < MAX_NUMBER_OF_REQUESTS ) {
            return true;
        } else {
            return false;
        }
    },

    incrementNotificationPermissionRequestCount: function(){
        let notificationPermissionRequestCount = this.attributes[ c.attr.NOTIFICATION_PERMISSION_REQUEST_COUNT_ATTRIBUTE ];

        if ( notificationPermissionRequestCount === undefined ){
            notificationPermissionRequestCount = 0;
        }

        this.attributes[ c.attr.NOTIFICATION_PERMISSION_REQUEST_COUNT_ATTRIBUTE ] = notificationPermissionRequestCount + 1;

        this.attributes[ c.attr.NOTIFICATION_PERMISSION_REQUEST_DATE_ATTRIBUTE ] = new Date();
    },

    askWithPermissionCard( output, reprompt ){
        notificationApi.incrementNotificationPermissionRequestCount.call( this );

        this.emit(':askWithPermissionCard', output, reprompt, c.PERMISSIONS);
    },

    tellWithPermissionCard( output, reprompt ){
        notificationApi.incrementNotificationPermissionRequestCount.call( this );

        this.emit(':tellWithPermissionCard', output, reprompt, c.PERMISSIONS);
    }
};

module.exports = notificationApi;
