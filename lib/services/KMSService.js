"use strict";

/**
 * KMS SERVICE
 *
 * Handles connections to the AWS KMS
 *
 */
const async = require( "async" ),
    AWS = require( "aws-sdk" ),
    err = require( "./../errors" ),
    utils = require( "./../utils/utils" );

/**
 *  Util Methods
 */
const kmsServiceUtils = function() {
    return {
        decrypt: function( encrypted ) {
            let p = new Promise( function( resolve, reject ){
                if ( utils.isObject( encrypted ) ) {
                    const kms = new AWS.KMS();

                    let decrypted = {};

                    async.forEachOf( encrypted, function ( value, key, callback ) {
                        if ( value ) {
                            kms.decrypt( { CiphertextBlob: new Buffer( value, "base64" ) }, ( err, data ) => {
                                if ( err ) {
                                    console.error( "Decrypt error--> " + key, err );

                                    decrypted[ key ] = null;

                                    return callback();
                                }

                                decrypted[ key ] = data.Plaintext.toString( "ascii" );

                                callback();
                            } );
                        } else {
                            decrypted[ key ] = null;

                            callback();
                        }
                    }, ( error ) => {
                        if ( error ) {
                            console.error( error.message );

                            reject( error );
                        }

                        resolve( decrypted );
                    } );

                } else {
                    reject( err.msg.ENCRYPTED_MISSING );
                }
            });

            return p;
        }
    }
}();

const kmsService = {
    decrypt: function( encrypted ) {
        let p = new Promise( function( resolve, reject ){
            if ( encrypted ) {
                if ( !utils.isObject( encrypted ) ) {
                    encrypted = { 0: encrypted };
                }

                kmsServiceUtils.decrypt( encrypted )
                .then( ( decrypted ) => {
                    resolve( decrypted );
                } )
                .catch( ( error ) => {
                    console.error( error );

                    reject( error );
                } );
            } else {
                reject( err.msg.NO_DATA );
            }
        });

        return p;
    }
};

module.exports.methods = kmsService;
module.exports.utils = kmsServiceUtils;
