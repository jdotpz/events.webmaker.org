module.exports = function (compound, Gallery) {
    var models = compound.models;

    Gallery.hasMany(models.GalleryImage,  { as: 'images', foreignKey: 'galleryId' });
    Gallery.belongsTo(models.Event,       { as: 'event',  foreignKey: 'eventId' });
};
