"use strict";

/**
 * UTILS
 *
 */
const c = require( "./constants" ),
      e = require( "./enums" );

/**
 *  Public Methods
 */
const utils = {
    checkValInArray: function( val, arr ) {
      if ( val && arr ) {
          if ( arr.indexOf( val ) > -1 ) {
            return val;
          }
      }

      return null;
    },

    /**
     * errorCheckCallback checks that a callback function is valid,
     * otherwise defines an empty function and returns it
     */
    errorCheckCallback: function( callback ) {
        // Check for valid callback, add default if needed
        return callback === undefined || typeof callback !== "function" ? function() {
            } : callback;
    },

    debugEnabled: function() {
        return process.env.LOG_LEVEL === e.logLevels.DEBUG;
    },

    /**
     * formUrlWithParams takes a URL and an object of params and forms
     * a valid URL with them
     */
    formUrlWithParams : function( url, params ) {
        // Form params with fallback
        params = params === undefined || typeof params !== "object" ? {} : params;

        // Check if there are params to append
        if ( !Object.keys( params ).length ) {
            return url;
        }

        // Check for any existing params
        url = url + ( url.indexOf( "?" ) !== -1 ? "&" : "?" );

        for( var key in params ) {
            // If the param value is "null", treat as a boolean param
            url += key + ( params[ key ] === null ? "" : "=" + params[ key ] ) + "&";
        }

        // Remove trailing ampersands
        return url.replace( /&$/, "" );
    },

    /**
     * Attempts to retrieve a value from a source object. If
     * the value couldn't be found, returns false or a specified
     * fallback value.
     *
     * @param  {string} key      Key of value to be retrieved. Can also be
     *                           specified using dot notation to retrieve
     *                           nested values. Ex: "content.title"
     * @param  {object} source   Source object.
     * @param  {mixed}  fallback Value to be returned if key could not be
     *                           retrieved.
     * @return {mixed}           Value of the key, false, or specified fallback
     */
    get: function( key, source, fallback ) {
        // use provided default or false
        fallback = ( typeof fallback === "undefined" ) ? false : fallback;

        if ( !key || !source ) {
            return fallback;
        }

        // get the key parts
        let parts = key.split( "." );

        // shift the first key off the front
        key = parts.shift();

        // if the source doesn't contain the key, return the fallback
        if (
            !source ||
            !Object.prototype.hasOwnProperty.call( source, key ) ||
            typeof source[ key ] === "undefined"
        ) {
            return fallback;
        }

        // if there are left over key parts, recurse. otherwise return the value
        return parts.length ? this.get( parts.join( "." ), source[ key ], fallback ) : source[ key ];
    },

    /**
     * event.session.user.accessToken
     */
    getAuthToken: function( event ) {
        return this.get( "session.user.accessToken", event, null );
    },

    /**
     * event.request.locale
     */
    getLocale: function( event ) {
        if ( event.request ) {
            return this.get( "locale", event.request, "en-US" );
        }

        return "en-US"; // default to US
    },

    /**
     * event.request.intent.name
     */
    getRequestIntent: function( event ) {
        return this.get( "request.intent.name", event, "" );
    },

    /**
     * event.request.intent.slots
     */
    getRequestIntentSlots: function( event ) {
        return this.get( "request.intent.slots", event, {} );
    },

    /**
     * event.session.sessionId
     */
    getSessionId: function( event, fallback ) {
        fallback = fallback || "";

        if ( event.session ) {
            return this.get( "sessionId", event.session, fallback );
        }

        return fallback;
    },

    /**
     * Returns value of slot for given name.
     *
     * @param slotName...slot name key
     * @param event......event object
     */
    getSlotValue: function( slotName, event, fallback ) {
        if ( fallback === undefined ) {
            fallback = null;
        }

        if ( event && typeof slotName === "string" ) {
            return this.get( "request.intent.slots." + slotName + ".value", event, fallback );
        }

        return fallback;
    },

    getSupportedLocale: function( locale ) {
      if ( this.get( locale, c.TIMEZONE_OFFSET )) {
        return locale;
      } else {
        return c.DEFAULT_LOCALE;
      }
    },

    /**
     * event.user.userId
     */
    getUserId: function( event, fallback ) {
        fallback = fallback || "";

        if ( event.session && event.session.user ) {
            return this.get( "userId", event.session.user, fallback );
        }

        return fallback;
    },

    /**
     * event.context.System.device.supportedInterfaces.Display
     */
    getDisplayInterface: function( event ){
        return this.get( "context.System.device.supportedInterfaces.Display", event, null );
    },

    // TODO: deprecate for method that checks for audio support only
    isDeviceSupport: function( event ){
        if ( this.get( "context.System.device.supportedInterfaces", event, false ) ) {
            if ( !this.get( "context.System.device.supportedInterfaces.AudioPlayer", event, false ) ) {
                return false;
            }
        }

        return true;
    },

    printObj: function( obj ) {
        var output = "";

        for ( var k in obj ) {
            output += k + ":" + obj[ k ] + "|";
        }

        console.log( output.slice( 0, -1 ) );
    },

    removeEmptyStringElements: function( obj ) {
        for ( var prop in obj ) {
            if ( typeof obj[ prop ] === "object" ) {// dive deeper in
                this.removeEmptyStringElements( obj[ prop ] );
            } else if ( obj[ prop ] === "" ) {// delete elements that are empty strings
                delete obj[ prop ];
            }
        }
        return obj;
    },

    /**
     * Sets the value on the object at the specified path.
     *
     * @param  {string} key      Key of value to be set. Can also be
     *                           specified using dot notation to set
     *                           nested values. Ex: "content.title"
     * @param  {object} source   Source object.
     * @param  {mixed}  value    Value to be set on object at key.
     * @return {mixed}           Value of the key, false, or specified fallback
     */
    set: function( key, source, value ) {
        if ( !key || !source ) {
            return;
        }

        const pList = key.split( "." ),
            len = pList.length;

        let schema = source;  // a moving reference to internal objects within obj

        for ( let i = 0; i < len-1; i++ ) {
            const elem = pList[ i ];

            if( !schema[ elem ] ) {
                schema[ elem ] = {};
            }

            if ( typeof schema[ elem ] !== "object" ) {
                return;
            }

            schema = schema[ elem ];
        }

        schema[ pList[ len-1 ] ] = value;
    },

    slotIsANumber: function( slot ) {
        if ( slot && slot.value && !isNaN( slot.value ) ) {
            return true;
        }

        return false;
    },

    /****************************
     ****** STRING UTILS ********
     ****************************
     */

    /**
     * Searches str for each key in mapObj and replaces with value of the key.
     *
     * @param str
     * @param mapObj
     * @return {*}
     */
    replaceAll: function( str, mapObj ) {
        if ( !str || typeof str !== "string" || !mapObj || typeof mapObj !== "object" || mapObj.constructor !== Object ) {
            return str;
        }

        const re = new RegExp( Object.keys( mapObj ).join( "|" ), "gi" );

        return str.replace( re, function( matched ) {
            return mapObj[ matched ];
        } );
    },

    replaceAudioTags: function( str ) {
        const pattern =  /<audio>(.*?)<\/audio>/g;

        const tags = str.match( pattern );

        if ( tags ) {
            const files = tags.map( function ( val ) {
                return val.replace( /<\/?audio>/g, '' );
            } );

            for ( let i = 0; i <= tags.length; i++ ) {
                const fileName = files[i];
                if ( !fileName ){
                    continue;
                }

                const url = this.makeAudioPath( files[ i ] );

                const audioTag = "<audio src=\"" + url + "\" />";

                str = str.replace( tags[ i ], audioTag );
            }
        }

        return str;
    },

    sanitizeSsml: function( ssml ) {
        if ( ssml && typeof ssml === "string" ) {
            return  ssml.replace( /&amp;/g, "and" )
            .replace( /&quot;/g, "\"" )
            .replace( /&/g, "and" );
        }

        return ssml;
    },

    trimItemsInArray: function( arr ) {
        if ( Array.isArray( arr ) ) {
            arr = arr.map( Function.prototype.call, String.prototype.trim );
        }

        return arr;
    },

    /****************************
     ******* PATH UTILS *********
     ****************************
     */
    makeImagePath:  function( url ) {
        if ( url && url.indexOf( e.protocol.HTTP ) !== 0 && url.indexOf( e.protocol.HTTPS ) !== 0 ) {
            return c.S3_HOST + c.S3_BUCKET + c.S3_IMAGE_PATH + url;
        }

        return url;
    },

    makeAudioPath: function( url ) {
        if ( url && url.indexOf( e.protocol.HTTP ) !== 0 && url.indexOf( e.protocol.HTTPS ) !== 0 ) {
            return c.S3_HOST + c.S3_BUCKET + c.S3_AUDIO_PATH + url;
        }

        return url;
    },

    /****************************
     ****** LOGGING UTILS *******
     ****************************
     */
    log: {
        debug: function( msg ) {
            if ( process.env.LOG_LEVEL === e.logLevels.DEBUG ) {
                console.log( msg );
            }
        }
    },

    logIntentData: function( event ) {
        if ( utils.debugEnabled() ) {
            utils.log.debug( "*************************** [ " + global.utils.getRequestIntent( event ) + " ] --> " );

            const slots = global.utils.get( "request.intent.slots", event );

            if ( slots ) {
                utils.log.debug( JSON.stringify( slots ) );
            }

            const attribs = global.utils.get( "session.attributes", event );

            if ( attribs ) {
                utils.log.debug( "attributes------->" );

                utils.log.debug( JSON.stringify( attribs ) );
            }
        }

        return;
    },

    logResponseData: function( response ) {
        if ( response && response._responseObject ) {
            utils.log.debug( "[response] -------> " + JSON.stringify( response._responseObject ) );
        }

        return;
    }
};

module.exports = utils;
