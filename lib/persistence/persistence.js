"use strict";
const c = require( "./../constants" ),
    DynamoDbPersistenceAdapter = require( "ask-sdk-dynamodb-persistence-adapter" ).DynamoDbPersistenceAdapter,
    utils = require( "./../utils/utils" );

const NOT_AN_OBJECT = "Argument is not an object";

const persistence =  {
    dynamoAdapter: new DynamoDbPersistenceAdapter( {
        tableName: c.DYNAMODB.TABLE,
        partitionKeyName: c.DYNAMODB.PARTITION_KEY,
        attributesName: c.DYNAMODB.ATTRIBUTES,
    } ),

    responseInterceptor: {
        process( handlerInput ) {
            return new Promise( ( resolve, reject ) => {
                handlerInput.attributesManager.savePersistentAttributes()
                .then( () => {
                    resolve();
                } )
                .catch( (error) => {
                    reject( error );
                } );
            } );
        }
    },

    setPersistentAttributes: async ( handlerInput, attribs ) => {
        if ( utils.isObject( attribs ) ) {
            const existing = await handlerInput.attributesManager.getPersistentAttributes();

            const newAttribs = Object.assign( existing, attribs );

            return handlerInput.attributesManager.setPersistentAttributes( newAttribs );
        } else {
            return Promise.reject( new Error( NOT_AN_OBJECT ) );
        }
    },

    setRequestAttributes: ( handlerInput, attribs ) => {
        if ( utils.isObject( attribs ) ) {
            const newAttribs = Object.assign( handlerInput.attributesManager.getRequestAttributes(), attribs );

            handlerInput.attributesManager.setRequestAttributes( newAttribs );
        }

        return;
    },

    setSessionAttributes: ( handlerInput, attribs ) => {
        if ( utils.isObject( attribs ) ) {
            const newAttribs = Object.assign( handlerInput.attributesManager.getSessionAttributes(), attribs );

            handlerInput.attributesManager.setSessionAttributes( newAttribs );
        }

        return;
    },

    /**
     * Adds or updates value of given persistent attribute.
     *
     * @param handlerInput...standard alexa handlerInput
     * @param attributeKey...key of attribute in session object
     * @param val............the new value
     */
    updatePersistentAttribute: await ( handlerInput, attributeKey, val ) => {
        if ( attributeKey && typeof attributeKey === "string" ) {
            return persistence.setPersistentAttributes( handlerInput, utils.set( attributeKey, {}, val ) );
        } else {
            return false;
        }
    },

    /**
     * Adds or updates value of given request attribute.
     *
     * @param handlerInput...standard alexa handlerInput
     * @param attributeKey...key of attribute in session object
     * @param val............the new value
     */
    updateRequestAttribute: ( handlerInput, attributeKey, val ) => {
        if ( attributeKey && typeof attributeKey === "string" ) {
            persistence.setRequestAttributes( handlerInput, utils.set( attributeKey, {}, val ) );
        }
    },

    /**
     * Adds or updates value of given session attribute.
     *
     * @param handlerInput...standard alexa handlerInput
     * @param attributeKey...key of attribute in session object
     * @param val............the new value
     */
    updateSessionAttribute: ( handlerInput, attributeKey, val ) => {
        if ( attributeKey && typeof attributeKey === "string" ) {
            persistence.setSessionAttributes( handlerInput, utils.set( attributeKey, {}, val ) );
        }
    }
};

module.exports = persistence;
