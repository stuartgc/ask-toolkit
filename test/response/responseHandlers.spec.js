"use strict";

const c = require( "./../../lib/analytics/constants" ),
    queue = require( "./../../lib/response/queue" ),
    responseObj = require( "./../json/response/response" ),
    responseHandlers = require( "./../../lib/response/responseHandlers" );

describe( "RESPONSE HANDLERS", function() {
    beforeEach( function() {
        Object.assign( responseHandlers, {
            attributes: {},

            handler: {
                state: "_FOO"
            },

            emit: ( name ) => {
                return name;
            },

            event: {
                session: {
                    user: {
                        userId: "abc123"
                    }
                },
                request: {
                    intent: {
                        name: "SignOnlyIntent",
                        slots: {
                            sign: {
                                name: "sign",
                                value: "Pisces"
                            }
                        }
                    },
                    locale: "MOON",
                    type: c.requestType.intentRequest
                }
            }
        } );
    } );

    describe( "responseHandlers[ \"::onBeforeResponse\" ]", function() {
        it( "Tracking with no extra methods", function( done ) {
            sinon.stub( responseHandlers, "emit" ).callsFake( ( a ) => {
                expect( a ).to.equal(  "::respond" );

                done();
            } );

            responseHandlers[ "::onBeforeResponse" ]( responseObj, null );
        } );
    } );

    describe( "responseHandlers[ \"::onBeforeResponse\" ]", function() {
        it( "Tracking with extra method", function( done ) {
            sinon.stub( responseHandlers, "emit" ).callsFake( ( a ) => {
                expect( a ).to.equal(  "::respond" );

                done();
            } );

            queue.addToBeforeResponse( "foo", function( cb ) {
                cb();
            } );

            responseHandlers[ "::onBeforeResponse" ]( responseObj, null );
        } );
    } );
} );
