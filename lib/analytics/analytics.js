"use strict";

const analyticsHandlers = require( "./analyticsHandlers" ),
    analyticsUtils = require( "./analyticsUtils" );

module.exports = {
    init: analyticsHandlers.sendRequestTracking,

    handlers: analyticsHandlers,

    utils: analyticsUtils
};
