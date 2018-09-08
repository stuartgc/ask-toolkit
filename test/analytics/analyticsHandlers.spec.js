"use strict";

const analytics = require( "./../../lib/analytics/analyticsHandlers" ),
    analyticsUtils = require( "./../../lib/analytics/analyticsUtils" ),
    e = require( "./../../lib/enums" ),
    Dashbot = require( "dashbot" )( process.env.ANALYTICS_TOKEN ).alexa,
    dashbotEventService = require( "./../../lib/analytics/dashbotEventService" );

describe( "ANALYTICS HANDLERS", function() {
    let callback,
        dashEventStub;

    beforeEach( function() {
        Object.assign( analytics, {
            attributes: {},

            handler: {
                state: "_FOO"
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
                    type: e.requestType.intentRequest
                }
            }
        } );

        callback = sinon.spy();

        dashEventStub = sinon.stub( dashbotEventService, "send" ).returnsArg( 1 );
    } );

    afterEach( function() {
        dashbotEventService.send.restore();
    } );

    describe( "analyticsHandlers.sendResponseTracking", function() {
        it( "Non-trackable session - userId is missing from event", function( done ) {
            const dashStub = sinon.stub( Dashbot, "logOutgoing" ).returnsArg( 1 );

            delete analytics.event.session.user.userId;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            sinon.assert.callCount( dashStub, 0 );

            Dashbot.logOutgoing.restore();

            done();
        } );
    } );

    describe( "analyticsHandlers.sendEvent", function() {
        it( "Valid params", function( done ) {
            const params = {
                foo: "bar"
            };

            analytics[ "sendEvent" ]( analytics.event, "trackingEvent", params, callback );

            expect( dashEventStub.calledWith( analytics.event, "trackingEvent", params ) ).to.be.true;

            analytics[ "sendEvent" ]( analytics.event, "trackingEvent" );

            expect( dashEventStub.calledWith( analytics.event, "trackingEvent", undefined ) ).to.be.true;

            done();
        } );

        it( "Incorrect params", function( done ) {
            analytics[ "sendEvent" ]( analytics.event, null, "trackingParams" );

            expect( dashEventStub.called ).to.be.false;

            //not trackable event
            const uid = analytics.event.session.user.userId;

            delete analytics.event.session.user.userId;

            analytics[ "sendEvent" ]( analytics.event, null, "trackingParams" );

            expect( dashEventStub.called ).to.be.false;

            analytics.event.session.user.userId = uid;

            done();
        } );
    } );

    describe( "analyticsHandlers.sendSponsorEvent", function() {
        it( "Valid params", function( done ) {
            const eventSpy = sinon.spy( analytics, "sendEvent" );

            analytics[ "sendSponsorEvent" ]( analytics.event, "campaignId", "adLabel" );

            expect( eventSpy.calledWith( analytics.event, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) );

            expect( dashEventStub.calledWith( analytics.event, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) ).to.be.true;

            analytics.sendEvent.restore();

            done();
        } );

        it( "Incorrect params", function( done ) {
            //not trackable event
            const eventSpy = sinon.spy( analytics, "sendEvent" );

            delete analytics.event.session.user.userId;

            analytics[ "sendSponsorEvent" ]( analytics.event, "campaignId", "adLabel" );

            expect( eventSpy.calledWith( analytics.event, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) );

            expect( dashEventStub.called ).to.be.false;

            analytics.sendEvent.restore();

            done();
        } );
    } );
} );
