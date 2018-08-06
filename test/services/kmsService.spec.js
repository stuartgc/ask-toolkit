"use strict";

const e = require( "./../../lib/errors" ),
    kmsService = require( "./../../lib/services/KMSService" ),
    AWS = require( "aws-sdk-mock" );

describe( "KMS SERVICE", function() {
    const encrypted = {
            API_SECRET: "AQICAHgNbxnKYUIfqmDWIvMSmsy2rrh10DcaiektszhgLs/64QEjmiLEzEukrurCJI8yJdNiAAAAYTBfBgkqhkiG9w0BBwagUjBQAgEAMEsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMlYPezCspvYdLibFyAgEQgB7EnbRt+fDd2pfX58zgmszVUUuKR37NYVV4opaOWl4=",
            API_KEY: "AQICAHgNbxnKYUIfqmDWIvMSmsy2rrh10DcaiektszhgLs/64QGxp1zUIjwVh49dEYs1fn+bAAAAYzBhBgkqhkiG9w0BBwagVDBSAgEAME0GCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMH6Zw2igOvDSPegSAAgEQgCDmjk4V/bK9qVTv0UlNb4HrQNOMYSv8zbTzfWipyrdw3Q=="
        },
        decrypted = {
            API_SECRET: "bar",
            API_KEY: "world"
        };

    beforeEach( function() {
        AWS.mock( "KMS", "decrypt", ( params, callback ) => {
            let key = null;

            for ( let k in encrypted ){
                const buf2 = new Buffer( encrypted[ k ], "base64" );

                if ( params.CiphertextBlob.equals( buf2 ) ) {
                    key = k;
                    break;
                }
            }

            if ( key ) {
                callback( null, { Plaintext: [ decrypted[ key ] ] } );
            } else {
                callback( e.msg.DECRYPT );
            }
        } );
    } );

    afterEach( function() {
        AWS.restore( "KMS", "decrypt" );
    } );

    describe( "kmsService.decrypt", function() {
        it( "Success - object decoded ", function() {
            const func = () => {
                return kmsService.methods.decrypt( encrypted )
                .then( ( data ) => {
                    expect( data ).to.deep.equal( decrypted );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "Success - string decoded ", function() {
            const func = () => {
                return kmsService.methods.decrypt( encrypted.API_SECRET )
                .then( ( data ) => {
                    expect( data[ 0 ] ).to.equal( decrypted.API_SECRET );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "Fail - no arg ", function() {
            const func = () => {
                return kmsService.methods.decrypt( null )
                .catch( ( error ) => {
                    expect( error ).to.equal( e.msg.NO_DATA );
                } );
            };

            func();
        } );
    } );

    describe( "kmsServiceUtils.decrypt", function() {
        it( "Success - object decoded ", function() {
            const func = () => {
                return kmsService.utils.decrypt( encrypted )
                .then( ( data ) => {
                    expect( data ).to.deep.equal( decrypted );
                } );
            };

            expect( func ).to.not.throw();
        } );

        it( "Fail - arg not object", function() {
            const func = () => {
                return kmsService.utils.decrypt( encrypted.API_SECRET )
                .catch( ( error ) => {
                    expect( error ).to.equal( e.msg.ENCRYPTED_MISSING );
                } );
            };

            func();
        } );

        it( "Fail - kms.decrypt error", function() {
            const func = () => {
                return kmsService.utils.decrypt( { foo: "something" } )
                .catch( ( error ) => {
                    expect( error ).to.equal( e.msg.DECRYPT );
                } );
            };

            func();
        } );
    } );

    describe( "kmsServiceUtils.isObject", function() {
        it( "Success - Object", function() {
            const result = kmsService.utils.isObject( {} );

            expect( result ).to.be.true;
        } );

        it( "Fail - String", function() {
            const result = kmsService.utils.isObject( "hello" );

            expect( result ).to.be.false;
        } );

        it( "Fail - Array", function() {
            const result = kmsService.utils.isObject( [] );

            expect( result ).to.be.false;
        } );

        it( "Fail - Number", function() {
            const result = kmsService.utils.isObject( 10 );

            expect( result ).to.be.false;
        } );

        it( "Fail - Function", function() {
            const result = kmsService.utils.isObject( function(){} );

            expect( result ).to.be.false;
        } );

        it( "Fail - null", function() {
            const result = kmsService.utils.isObject( null );

            expect( result ).to.be.null;
        } );

        it( "Fail - undefined", function() {
            const result = kmsService.utils.isObject();

            expect( result ).to.be.undefined;
        } );

        it( "Fail - Boolean", function() {
            const result = kmsService.utils.isObject( true );

            expect( result ).to.be.false;
        } );

        it( "Fail - RegExp", function() {
            const result = kmsService.utils.isObject( new RegExp() );

            expect( result ).to.be.false;
        } );

        it( "Fail - Error", function() {
            const result = kmsService.utils.isObject( new Error() );

            expect( result ).to.be.false;
        } );

        it( "Fail - Date", function() {
            const result = kmsService.utils.isObject( new Date() );

            expect( result ).to.be.false;
        } );
    } );
} );
