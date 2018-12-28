# ask-toolkit

Helper methods to be used in conjunction with Amazon's `ask-sdk`. (https://ask-sdk-for-nodejs.readthedocs.io/en/latest/)

## install
`npm install --save ask-toolkit`

## response handlers
Creates display templates, sends tracking events (if configured), links accounts with LWA (if configured) and sends response to Alexa.
 
 #### TO USE:
 * `index.js`
    * add `alexa.registerHandlers( responseHandlers, ... )`
 * responseHandlers file
    * add `responseBuilder = require( "ask-toolkit" ).response.builder`
    * export handlers as array `module.exports = [ handler1, handler2, etc ];`
    * Replace `return handlerInput.responseBuilder.getResponse()` with `return responseBuilder.ask( handlerInput, responseObj );` 
 
 #### EXAMPLE:
 Replace 
 ```
 return handlerInput.responseBuilder.speak( output ).reprompt( reprompt ).withSimpleCard( cardTitle, card ).getResponse()
 ``` 

with  

 ```
 return responseBuilder.ask( handlerInput, { speech: { output: output, reprompt: reprompt }, card: { title: cardTitle, output: card } } )
 ```
 
 #### METHODS:
 1) `responseBuilder.ask( handlerInput, askData, options )`
 2) `responseBuilder.tell( handlerInput, tellData, options )`
 3) `responseBuilder.askForPermissions( handlerInput, data, options, permissions )`
 4) `responseBuilder.sendDirective( handlerInput, directiveObject )`
 5) `responseBuilder.sendLinkAccountCard( handlerInput, data, options )`
 
 #### PARAMS:
 ```
 askData = {
     card: (Card),
     speech: {
         output: (String),
         reprompt: (String)
     },
     display: (Display)
 }
 ```
 
 ```
 tellData = {
     card: (Card),
     speech: {
         output: (String)
     },
     display: (Display)
 }
 ```
 
 ```
 options = {
     outgoingIntent: {
         name: (String),
         slots: {
             (String): {
                 name: (String),
                 value: (String)
         }
     },
     repeatSpeech: {  // Can also be passed as data.repeatSpeech
        output: (String),
        reprompt: (String)
     },
     saveRepeat: (Boolean) true,
     shouldEndSession: true | false | null,
     track: (Boolean) true
 }
 ```
 
 #### OBJECTS:
 ```
 Card = {
     image: {
         smallImageUrl: (URL),
         largeImageUrl: (URL)
     },
     output: (String),
     title: (String)
 }

 ```
 
 ```
 Display = {
    actionLinks: (Unknown),
    backButton: (Enum) HIDDEN | VISIBLE (default),
    backgroundImage: (ImageObj),
    hint: (String),
    image: (ImageObj),
    list: [List],
    template: (Enum) BodyTemplate1 | BodyTemplate2 | BodyTemplate3 | BodyTemplate6 | BodyTemplate7 | ListTemplate1 | ListTemplate2,
    text: {
        primary: (TextObj),
        secondary: (TextObj),
        tertiary: (TextObj),
    },
    title: (String),
    token: (String)
 }
 ```
 
 ```
 ImageObj = {
     url: (URL),
     description: (String)(optional)
     height: (Int)(optional),
     width: (Int)(optional),
     size: (Enum)(optional) X_SMALL | SMALL | MEDIUM | LARGE | X_LARGE
 }
 ```
 
 ```
 List = {
    image: (ImageObj)
     text: {
         primary: (TextObj),
         secondary: (TextObj),
         tertiary: (TextObj),
     },
     token: (String)
 }
 ```
 
 ```
 TextObj = {
     type: (Enum) PlainText | RichText,
     text: (String)
 }
 ```
#### image specs
 * __BackgroundImage__
    - 1024 x 600
    
 * __ListTemplate1__
    - 88 x 88
    
 * __ListTemplate2__
    - Portrait (192 x 280)
    - Square (280 x 280)
    - 4:3 (372 x 280)
    - 16:9 (498 x 280)
    
 * __BodyTemplate1__
    - inline images only
 
 * __BodyTemplate2__
    - 340 x 340
    
 * __BodyTemplate3__
    - 340 x 340
 
 * __BodyTemplate6__
    - 340 x 340
    
 * __BodyTemplate7__
    - scalable
    - maintains aspect ratio
 
 __Size Recommendations:__
 * X_SMALL: 480 x 320
 * SMALL: 720 x 480
 * MEDIUM:  960 x 640
 * LARGE: 1200 x 800
 * X_LARGE: 1920 x 1280
## response utils
#### `ask-tools.response.utils.replaceInSpeechAndCard( responseData, replaceObj )`
* Replaces all instances of replaceObj key with value of replaceObj key in responseData speech output, speech reprompt, card title and card reprompt.
* _Example:_
  ```
    ask-tools.response.utils.replaceInSpeechAndCard(
        {
            speech: {
                output: "replace {foo}"
            }
        },
        {
            "{foo}": "bar"
        }
    );
    ```
    returns: 
    ```
    {
        speech: {
            output: "replace bar"
        }
    }
    ```
    
#### `ask-tools.response.utils.replaceInDisplay( responseData, replaceObj )`
* Replaces all instances of replaceObj key with value of replaceObj key in responseData display primary, secondary and tertiary text.
* _Example:_
  ```
    ask-tools.response.utils.replaceInDisplay(
        {
            display: {
                "template": "BodyTemplate2",
                "text": {
                    "primary": {
                        "type": "RichText",
                        "text": "replace {foo}"
                    },
                    "secondary": {
                        "type": "RichText",
                        "text": "replace {foo}"
                    },
                    "tertiary": {
                        "type": "PlainText",
                        "text": "replace {foo}"
                    }
                }
            }
        },
        {
            "{foo}": "bar"
        }
    );
    ```
    returns: 
    ```
    {
        display: {
           "template": "BodyTemplate2",
           "text": {
               "primary": {
                   "type": "RichText",
                   "text": "replace bar"
               },
               "secondary": {
                   "type": "RichText",
                   "text": "replace bar"
               },
               "tertiary": {
                   "type": "PlainText",
                   "text": "replace bar"
               }
           }
       }
    }
    ```

#### `ask-tools.response.utils.replaceInAll( responseData, replaceObj )`
* Makes calls to `replaceInSpeechAndCard` and `replaceInDisplay`
    

## analytics
* Add `ANALYTICS_PROVIDER` env var (default: DASHBOT)
 ```
 ask-tools.analytics.enums.analyticsProvider = {
      DASHBOT: "dashbot"
 }
 ```
* Add `ANALYTICS_TOKEN` env var
* `index.js`
    * add `analytics = require( "ask-tools" ).analytics`
    * add `Alexa.SkillBuilders.custom().addRequestInterceptors( analytics.sendRequestTracking )`

## isp
* Helper methods for In-Skill Purchasing
* `index.js`
    * add  `Alexa.SkillBuilders.custom().withApiClient( new Alexa.DefaultApiClient() )`

## list-api
* Helper methods for adding items to an Alexa list
* `index.js`
    * add `Alexa.SkillBuilders.custom().withApiClient( new Alexa.DefaultApiClient() )`
    
## localization
* Helper methods for internationalization
* `index.js`
    * add `const localization = require( "ask-toolkit" ).localization( strings );`
    * add `Alexa.SkillBuilders.custom().addRequestInterceptors( localization.requestInterceptor )`
* access strings in handlers through `handlerInput.attributesManager.getRequestAttributes().t( stringKey )`

## persisitence
* Helper methods for working with and storing to DynamoDB
* Object automatically stored on every response. 
* `index.js`
    * add `persistence = require( "ask-toolkit" ).persistence`
    * add `Alexa.SkillBuilders.custom().withPersistenceAdapter( persistence.dynamoAdapter( process.env.DYNAMODB_TABLE ) )`

### persistence methods
All methods are additive.  They do not overwrite other object properties.
1) `async setPersistentAttributes( handlerInput, attributeObject )`
2) `setRequestAttributes( handlerInput, attributeObject )`
3) `setSessionAttributes( handlerInput, attributeObject )`
4) `async updatePersistentAttribute( handlerInput, attributeKey, val )`
5) `updateRequestAttribute( handlerInput, attributeKey, val )`
6) `updateSessionAttribute( handlerInput, attributeKey, val )`

## services
* KMS - Promise helper to decrypt encrypted ENV vars
    * `kmsService = require( "ask-toolkit" ).kmsService`
    * `await kmsService.decrypt( { apiKey: process.env[ "API_KEY" ] } );`
    
## utils
* General helper methods.
