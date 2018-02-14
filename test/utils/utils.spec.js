"use strict";

const utils = require( "./../../lib/utils/utils" );

describe( "utils.getSupportedLocale", function() {
    it( "should return correct locale for en-US", function() {
        let locale = utils.getSupportedLocale( "en-US" );

        expect( locale ).to.equal( "en-US" );
    } );

    it( "should return correct locale for en-GB", function() {
        let locale = utils.getSupportedLocale( "en-GB" );

        expect( locale ).to.equal( "en-GB" );
    } );

    it( "should return en-US for non supported locale", function() {
        let locale = utils.getSupportedLocale( "en-CA" );

        expect( locale ).to.equal( "en-US" );
    } );
} );
