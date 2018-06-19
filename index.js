"use strict";

const analytics = require( "./lib/analytics/analytics" ),
    // list = require( "./lib/list-api/list" ),
    localization = require( "./lib/localization/localization" ),
    response = require( "./lib/response/response" ),
    utils = require( "./lib/utils/utils" );

//TODO: fix list
module.exports.analytics = analytics;
// module.exports.list = list;
module.exports.localization = localization;
module.exports.response = response;
module.exports.utils = utils;
