"use strict";

const async = require( "async" );

let beforeResponseQueue = {};

const responseQueue = {
    addToBeforeResponse: function( key, method ) {
        if ( key && typeof key === "string" && method && typeof method === "function" ) {
            beforeResponseQueue[ key ] = method;
        }

        return;
    },

    runBeforeResponse: function( scope, cb ) {
        let queue = [];

        for ( let k in beforeResponseQueue ) {
            if ( beforeResponseQueue[ k ] && typeof beforeResponseQueue[ k ] === "function" ) {
                queue.push( beforeResponseQueue[ k ].bind( scope ) );
            }
        }

        async.series( queue, cb );
    }
};

module.exports = responseQueue;
