module.exports = function (compound, Guide) {
    var models = compound.models;

    Guide.belongsTo(models.Party,  { as: 'party', foreignKey: 'uri' });
};
