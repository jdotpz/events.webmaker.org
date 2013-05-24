/*
 db/schema.js contains database schema description for application models
 by default (when using jugglingdb as ORM) this file uses database connection
 described in config/database.json. But it's possible to use another database
 connections and multiple different schemas, docs available at

 http://jugglingdb.co/

*/

function Model(name, fields) {
    return define(name, function () {
        for (var f in fields)
            property(f, fields[f]);
    });
}

Model('Event', {
    title:          String,
    description:    Text,
    address:        String,
    latitude:       Number,
    longitude:      Number,
    attendees:      Number, // enum(0..5)
    timeZone:       Number, // UTC +- N
    beginDate:      Date,   // UTC
    beginTime:      Number, // ms from 0:00
    endDate:        Date,
    endTime:        Number,
    registerLink:   String, // registration URL
    picture:        Text,   // blob -- TODO: validate as image
    organizer:      String, // email address
    created:        Date,
});
Model('Gallery', {
    uri:            String,
    eventId:        Number,
});
Model('GalleryImage', {
    uri:            String,
    galleryId:      Number,
});
Model('Make', {
    uri:            String,
    eventId:        Number,
});
Model('Guide', {
    uri:            String,
    eventId:        Number,
});
