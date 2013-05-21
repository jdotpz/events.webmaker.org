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
    description:    String,
    address:        String,
    latitude:       Number,
    longitude:      Number,
    begins:         Date,
    ends:           Date,
    resource:       String, // TODO: validate as URI
    organizer:      String,
    partner:        String,
    image:          String,
    created:        Date,
});
Model('Gallery', {
    uri:            String,
});
Model('GalleryImage', {
    uri:            String,
});
Model('Make', {
    uri:            String,
});
Model('Guide', {
    uri:            String,
});
