"use strict";

const async = require( "async" );

let beforeResponseQueue = [];

const responseQueue = {
    addToBeforeResponse: function( method ) {
        if ( method && typeof method === "function") {
            beforeResponseQueue.push( method );
        }

        return;
    },

    runBeforeResponse: function( scope, cb ) {
        let queue = [];

        for ( let i = 0; i < beforeResponseQueue.length; i++ ) {
            if ( beforeResponseQueue[ i ] && typeof beforeResponseQueue[ i ] === "function" ) {
                queue.push( beforeResponseQueue[ i ].bind( scope ) );
            }
        }

        async.series( queue, cb );
    }
};

module.exports = responseQueue;
