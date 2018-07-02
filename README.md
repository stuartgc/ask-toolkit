# alexa-toolkit

Helper methods to be used in conjunction with Amazon's `alexa-sdk`.

## install
`npm install --save alexa-toolkit`

## response handlers
Creates display templates, sends tracking events (if configured), links accounts with LWA (if configured) and sends response to Alexa.
 
 #### TO USE:
 * `index.ts`
    * add `responseHandlers = require( "alexa-tools" ).response.handlers`
    * add `alexa.registerHandlers( responseHandlers, ... )`
 * Replace all emits to `":ask"`, `":askWithCard"`, `":tell"` or `":tellWithCard"` with `"::ask"` or `"::tell"` 
 
 #### EXAMPLES:
 1) Replace `this.emit( ":askWithCard", output, reprompt, cardTitle, card )`  with    `this.emit( "::ask", { speech: { output: output, reprompt: reprompt }, card: { title: cardTitle, output: card } } )`
 2) Replace `this.emit( ":tell", output )`
  with    `this.emit( "::tell", { speech: { output: output} } )`
 
 #### HANDLERS:
 1) `this.emit( "::ask", askData, options)`
 2) `this.emit( "::tell", tellData, options)`
 
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
#### `alexa-tools.response.utils.replaceInSpeechAndCard( responseData, replaceObj )`
* Replaces all instances of replaceObj key with value of replaceObj key in responseData speech output, speech reprompt, card title and card reprompt.
* _Example:_
  ```
    alexa-tools.response.utils.replaceInSpeechAndCard(
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
    
#### `alexa-tools.response.utils.replaceInDisplay( responseData, replaceObj )`
* Replaces all instances of replaceObj key with value of replaceObj key in responseData display primary, secondary and tertiary text.
* _Example:_
  ```
    alexa-tools.response.utils.replaceInDisplay(
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

#### `alexa-tools.response.utils.replaceInAll( responseData, replaceObj )`
* Makes calls to `replaceInSpeechAndCard` and `replaceInDisplay`
    

## analytics
* Add `ANALYTICS_PROVIDER` env var (default: VOICELAB)
 ```
 alexa-tools.analytics.enums.analyticsProvider = {
      DASHBOT: "dashbot",
      VOICELAB: "voicelab"
 }
 ```
* Add `ANALYTICS_TOKEN` env var
* `index.ts`
    * add `analytics = require( "alexa-tools" ).analytics`
    * add `analytics.init( event );` after Alexa instantiation.
* Use response handlers `::ask` and `::tell`

## list-api
* Helper methods for adding items to an Alexa list

## utils
* General helper methods.
