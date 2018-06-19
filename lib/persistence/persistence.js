"use strict";
const c = require( "./../constants" ),
    DynamoDbPersistenceAdapter = require( "ask-sdk-dynamodb-persistence-adapter" ).DynamoDbPersistenceAdapter

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
    }
};

module.exports = persistence;
