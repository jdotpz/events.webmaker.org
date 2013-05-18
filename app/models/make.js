module.exports = function (compound, Make) {
    var models = compound.models;

    Make.belongsTo(models.Event,  { as: 'event', foreignKey: 'uri' });
};
