module.exports = function (compound, Party) {
    var models = compound.models;

    Party.hasMany(models.Gallery,  { as: 'galleries',  foreignKey: 'uri' });
    Party.hasMany(models.Make,     { as: 'makes',      foreignKey: 'uri' });
    Party.hasMany(models.Guide,    { as: 'guides',     foreignKey: 'uri' });
};
