"use strict";

/**
 * KMS SERVICE
 *
 * Handles connections to the AWS KMS
 *
 */
const async = require( "async" ),
    AWS = require( "aws-sdk" ),
    err = require( "./../errors" );

/**
 *  Util Methods
 */
const kmsServiceUtils = function() {
    return {
        decrypt: async ( encrypted ) => {
            if ( kmsServiceUtils.isObject( encrypted ) ) {
                const kms = new AWS.KMS();

                let decrypted = {};

                async.forEachOf( encrypted, function ( value, key, callback ) {
                    if ( value ) {
                        kms.decrypt( { CiphertextBlob: new Buffer( value, "base64" ) }, ( error, data ) => {
                            if ( error ) {
                                console.error( key + err.msg.KMS.DECRYPT, error );

                                decrypted[ key ] = null;

                                return callback();
                            }

                            decrypted[ key ] = data.Plaintext.toString( "ascii" );

                            callback()
                        } );
                    } else {
                        decrypted[ key ] = null;

                        callback()
                    }
                }, ( error ) => {
                    if ( error ) {
                        console.error( error.message, error );

                        return Promise.reject( error );
                    }

                    return decrypted;
                } );

            } else {
                return Promise.reject( err.msg.KMS.ENCRYPTED_MISSING );
            }
        },

        isObject: ( val ) => {
            return val && typeof val === "object" && val.constructor === Object;
        }
    }
}();

const kmsService = {
    decrypt: async ( encrypted ) => {
        if ( encrypted ) {
            if ( !kmsServiceUtils.isObject( encrypted ) ) {
                encrypted = { 0: encrypted };
            }

            kmsServiceUtils.decrypt( encrypted )
            .then( ( decrypted ) => {
                return decrypted;
            } )
            .catch( ( error ) => {
                console.error( "kmsService: ", error );

                return Promise.reject( error );
            } );
        } else {
            return Promise.reject( err.msg.NO_DATA );
        }
    }
};

module.exports.methods = kmsService;
module.exports.utils = kmsServiceUtils;
