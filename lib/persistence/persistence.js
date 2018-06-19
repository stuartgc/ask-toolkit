"use strict";

const persistence =  {
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
