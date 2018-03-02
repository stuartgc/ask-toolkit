"use strict";

const c = require( "./../../lib/analytics/constants" ),
    queue = require( "./../../lib/response/queue" ),
    responseObj = require( "./../json/response/response" ),
    responseHandlers = require( "./../../lib/response/responseHandlers" );

describe( "RESPONSE HANDLERS", function() {
    const callback = sinon.stub().returnsArg( 0 );

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

    afterEach( function() {
    } );

    describe( "responseHandlers[ \"::onBeforeResponse\" ]", function() {
        it( "Tracking with no extra methods", function( done ) {
            const spy = sinon.spy( responseHandlers, "emit" );

            responseHandlers[ "::onBeforeResponse" ]( responseObj, null );

            expect( spy.calledWith( "::respond" ) ).to.be.true;

            done();
        } );
    } );

    describe( "responseHandlers[ \"::onBeforeResponse\" ]", function() {
        it( "Tracking with extra method", function( done ) {
            const spy = sinon.spy( responseHandlers, "emit" );

            queue.addToBeforeResponse( function( cb ) {
                cb();
            } );

            responseHandlers[ "::onBeforeResponse" ]( responseObj, null );

            expect( spy.calledWith( "::respond" ) ).to.be.true;

            done();
        } );
    } );
} );
