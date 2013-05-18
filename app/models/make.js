module.exports = function (compound, Make) {
    var models = compound.models;

    Make.belongsTo(models.Party,  { as: 'party', foreignKey: 'uri' });
};
