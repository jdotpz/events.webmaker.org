module.exports = function (compound, Gallery) {
    var models = compound.models;

    Gallery.hasMany(models.GalleryImage,  { as: 'images', foreignKey: 'uri' });
    Gallery.belongsTo(models.Event,       { as: 'event',  foreignKey: 'uri' });
};
