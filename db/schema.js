/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://railwayjs.com/orm.html

 Example of model definition:

 define('User', function () {
     property('email', String, { index: true });
     property('password', String);
     property('activated', Boolean, {default: false});
 });

 Example of schema configured without config/database.json (heroku redistogo addon):
 schema('redis', {url: process.env.REDISTOGO_URL}, function () {
     // model definitions here
 });

*/

define( 'Event',
function () {
    property('uri'          , String );
    property('title'        , String );
    property('description'  , Text   );
    property('address'      , String );
    property('latitude'     , Number );
    property('longitude'    , Number );
    property('begins'       , Date   );
    property('ends'         , Date   );
    property('eventLink'    , String );
    property('organizer'    , String );
    property('partner'      , String );
    property('image'        , String );
    property('createdAt'    , Date   );
});
define( 'Gallery',
function () {
    property('uri'          , String );
});
define( 'GalleryImage',
function () {
    property('uri'          , String );
});
define( 'Make',
function () {
    property('uri'          , String );
});
define( 'Guide',
function () {
    property('uri'          , String );
});
