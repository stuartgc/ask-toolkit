"use strict";

const c = require( "./../../lib/lwa/constants" ),
      e = require( "./../../lib/lwa/errors" ),
      lwaApi = require( "./../../lib/lwa/lwaApi" ).methods,
      lwaUtils = require( "./../../lib/lwa/lwaApi" ).utils,
      request = require( "request" );

describe( "LWA API", function() {
    const strings = {
        API_KEY: "ABABABABAB",
        CONSUMER_ID: "consumerId",
        CONTENT_ID: "XXXXX",
        NAME: "name",
        EMAIL: "email",
        USER_ID: "userId"
    };

    let reqGet,
        reqPost;

    beforeEach( function() {
        Object.assign( lwaApi, {
            attributes: {
                persist: {}
            },

            handler: {},

            event: {
                session: {
                    user: {
                        userId: "abc123",
                        accessToken: strings.API_KEY
                    }
                }
            }
        } );

        reqGet = sinon.stub( request, "get" ).callsFake( function( options, cb ) {
            const data = {
                name: strings.NAME,
                email: strings.EMAIL,
                user_id: strings.USER_ID,
            };

            Object.assign( data, {
                options: options
            } );

            if ( cb ) {
                cb( null, { statusCode: 200 }, JSON.stringify( data ) );
            }
        } );

        reqPost = sinon.stub( request, "post" ).callsFake( function( options, cb ) {
            const data = {
                success: true,
                data: {
                    consumerId: strings.USER_ID
                }
            };

            Object.assign( data, {
                options: options
            } );

            if ( cb ) {
                cb( null, { statusCode: 200 }, data );
            }
        } );
    } );

    afterEach( function() {
        request.get.restore();
        request.post.restore();
    } );

    describe( "lwaApi.init - Initialize", function() {
        it( "lwaUtils.apiKey should equal strings.API_KEY", function() {
            lwaApi.init( strings.API_KEY );

            expect( lwaUtils.apiKey ).to.equal( strings.API_KEY );
        } );

        it( "lwaUtils.apiKey should equal null", function() {
            lwaApi.init();

            expect( lwaUtils.apiKey ).to.equal( null );
        } );
    } );

    describe( "lwaApi.linkUser - Link User", function() {
        it( "Success - should return strings.USER_ID", function( done ) {
            const callback = sinon.spy();

            lwaApi.init( strings.API_KEY );

            lwaApi.linkUser.call( lwaApi, callback );

            assert( callback.calledWith( null, strings.USER_ID ) );

            done();
        } );

        it( "Existing consumer id in attributes - should return value of this.attibutes.persist.apiUser (strings.CONSUMER_ID)", function( done ) {
            const callback = sinon.spy();

            lwaApi.attributes[ c.attr.PERSIST ][ c.attrPerm.API_USER ] = strings.CONSUMER_ID;

            lwaApi.linkUser.call( lwaApi, callback );

            assert( callback.calledWith( null, strings.CONSUMER_ID ) );

            done();
        } );
    } );

    describe( "lwaApi.sendEmailWithUpdate - Send Email and Update Profile", function() {
        it( "Not linked - should return e.msg.NOT_LINKED", function( done ) {
            const callback = sinon.spy();

            lwaApi.init( strings.API_KEY );

            lwaApi.sendEmailWithUpdate.call( lwaApi, strings.CONTENT_ID, callback );

            assert( callback.calledWith( null, sinon.match( {
                    data: {
                        consumerId: strings.USER_ID
                    }
                } )
            ) );

            done();
        } );

        it( "Success - should return data object with id set to strings.USER_ID", function( done ) {
            const callback = sinon.spy();

            lwaApi.init( strings.API_KEY );

            lwaApi.attributes[ c.attr.PERSIST ][ c.attrPerm.API_USER ] = strings.CONSUMER_ID;

            lwaApi.sendEmailWithUpdate.call( lwaApi, strings.CONTENT_ID, callback );

            assert( callback.calledWith( null, sinon.match( {
                    data: {
                        consumerId: strings.USER_ID
                    }
                } )
            ) );

            done();
        } );
    } );
} );
