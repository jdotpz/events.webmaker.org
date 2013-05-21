module.exports = function (compound, Guide) {
    var models = compound.models;

    Guide.belongsTo(models.Event,  { as: 'event', foreignKey: 'eventId' });
};
