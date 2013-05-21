module.exports = function (compound, Event) {
    var models = compound.models;

    Event.hasMany(models.Gallery,  { as: 'galleries',  foreignKey: 'eventId' });
    Event.hasMany(models.Make,     { as: 'makes',      foreignKey: 'eventId' });
    Event.hasMany(models.Guide,    { as: 'guides',     foreignKey: 'eventId' });

    // TODO: move URI method into Event-resource
    Event.prototype.uri = function () {
        return '/events/' + this.id
    }
};
