"use strict";

const analytics = require( "./../../lib/analytics/analyticsHandlers" ),
    c = require( "./../../lib/analytics/constants" ),
    Dashbot = require( "dashbot" )( process.env.ANALYTICS_TOKEN ).alexa,
    VoiceLabs = require( "voicelabs" )( process.env.ANALYTICS_TOKEN );

describe( "ANALYTICS HANDLERS", function() {
    let callback,
        dashStub,
        viStub;

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
                    type: c.requestType.intentRequest
                }
            }
        } );

        callback = sinon.spy();

        dashStub = sinon.stub( Dashbot, "logOutgoing" ).returnsArg( 1 );

        viStub = sinon.stub( VoiceLabs, "track" ).returnsArg( 2 );
    } );

    afterEach( function() {
        Dashbot.logOutgoing.restore();

        VoiceLabs.track.restore();
    } );

    describe( "analyticsHandlers.sendResponseTracking", function() {
        it( "Non-trackable session - userId is missing from event", function( done ) {
            delete analytics.event.session.user.userId;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            sinon.assert.callCount( viStub, 0 );

            done();
        } );

        it( "Launch Request - track method intentName equal to c.requestType.launchRequest", function( done ) {
            analytics.event.request.type = c.requestType.launchRequest;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            expect( viStub.args[ 0 ][ 1 ] ).to.equal( c.requestType.launchRequest );

            done();
        } );

        it( "Audio Player - track method intentName  equal to c.requestType.audioPlayer", function( done ) {
            analytics.event.request.type = c.requestType.audioPlayer;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            expect( viStub.args[ 0 ][ 1 ] ).to.equal( c.requestType.audioPlayer );

            done();
        } );

        it( "Playback Controller - track method intentName equal to c.requestType.playbackController", function( done ) {
            analytics.event.request.type = c.requestType.playbackController;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            expect( viStub.args[ 0 ][ 1 ] ).to.equal( c.requestType.playbackController );

            done();
        } );

        it( "Session Ended - track method intentName argument equal to c.SESSION_END", function( done ) {
            analytics.event.request.type = c.requestType.sessionEndedRequest;

            analytics[ "sendResponseTracking" ]( {}, null, callback );

            expect( viStub.args[ 0 ][ 1 ] ).to.equal( c.SESSION_END );

            done();
        } );

        it( "Regular Intent - track method intentName argument equal to analytics.event.request.intent.name and metadata.slots equal to analytics.event.request.intent.slots", function( done ) {
            analytics[ "sendResponseTracking" ]( {}, null, callback );

            expect( viStub.args[ 0 ][ 1 ] ).to.equal( analytics.event.request.intent.name );

            expect( viStub.args[ 0 ][ 2 ].slots ).to.equal( analytics.event.request.intent.slots );

            done();
        } );
    } );

    describe( "analyticsHandlers.sendEvent", function() {
        it( "Valid params", function( done ) {
            analytics[ "sendEvent" ]( analytics.event, "trackingEvent", "trackingParams", callback );

            //sinon.assert.calledWith( viStub, "trackingEvent", "trackingParams" );

            expect( viStub.calledWith( analytics.event.session, "trackingEvent", "trackingParams" ) ).to.be.true;

            analytics[ "sendEvent" ]( analytics.event, "trackingEvent" );

            expect( viStub.calledWith( analytics.event.session, "trackingEvent", null ) ).to.be.true;

            done();
        } );

        it( "Incorrect params", function( done ) {
            analytics[ "sendEvent" ]( analytics.event, null, "trackingParams" );

            expect( viStub.called ).to.be.false;

            //not trackable event
            const uid = analytics.event.session.user.userId;

            delete analytics.event.session.user.userId;

            analytics[ "sendEvent" ]( analytics.event, null, "trackingParams" );

            expect( viStub.called ).to.be.false;

            analytics.event.session.user.userId = uid;

            done();
        } );
    } );

    describe( "analyticsHandlers.sendSponsorEvent", function() {
        it( "Valid params", function( done ) {
            const eventSpy = sinon.spy( analytics, "sendEvent" );

            analytics[ "sendSponsorEvent" ]( analytics.event, "campaignId", "adLabel" );

            expect( eventSpy.calledWith( analytics.event, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) );

            expect( viStub.calledWith( analytics.event.session, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) ).to.be.true;

            eventSpy.restore();

            done();
        } );

        it( "Incorrect params", function( done ) {
            //not trackable event
            const eventSpy = sinon.spy( analytics, "sendEvent" );

            delete analytics.event.session.user.userId;

            analytics[ "sendSponsorEvent" ]( analytics.event, "campaignId", "adLabel" );

            expect( eventSpy.calledWith( analytics.event, "SponsorPlayedEvent", { campaignId: "campaignId", label: "adLabel" } ) );

            expect( viStub.called ).to.be.false;

            eventSpy.restore();

            done();
        } );
    } );
} );
