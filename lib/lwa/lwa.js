"use strict";

/**
 * Handles linking account user between Amazon and Voice Admin servers.
 *
 * Required:
 * - env.API_APP_ID
 * - env.API_HOST
 * - API_KEY - must be set after decode
 *
 * Uses:
 * - this.attributes.persist.apiUser
 *
 */

const constants = require( "./constants" ),
    lwaApi = require( "./lwaApi" );

module.exports = {
    api: lwaApi.methods,

    constants: constants
};
