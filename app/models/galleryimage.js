module.exports = function (compound, GalleryImage) {
    var models = compound.models;

    GalleryImage.belongsTo(models.Gallery,  { as: 'gallery', foreignKey: 'galleryId' });
};
