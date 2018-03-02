"use strict";

let beforeResponseQueue = [];

const responseQueue = {
    addToBeforeResponse: function( method ) {
        if ( method && typeof method === "function" ) {
            beforeResponseQueue.push( method );
        }

        return;
    },

    getBeforeResponse: function() {
        return beforeResponseQueue;
    }
};

module.exports = responseQueue;
