define(['jquery'], function ($) {

    function ResourceModel(path, fields, pk) {
        this._route = path;
        this._pk = pk || 'id';
        this._changed = 0;
        this._data = null;
        if (fields instanceof Array) {
            this._fields = fields;
            fields.forEach(function (field) {
                if (field == 'pk')
                    throw "You have a field named 'pk'. Don't do that.";
                Object.defineProperty(this, field, {
                    get: function () { return this._data[field] }, 
                    set: function (val) { this._data[field] = val;
                                          this._changed = true; },
                });
            }, this);
        } else {
            this._fields = Object.keys(fields);
            for (var f in fields)
                Object.defineProperty(this, f, fields[f]);
        }
    }
    Object.defineProperty(ResourceModel.prototype, 'pk', {
        get: function () {
            return (!this._data || this._data[this._pk] == undefined)
                ? null : this._data[this._pk];
        }
    });
    Object.defineProperty(ResourceModel.prototype, 'uri', {
        get: function () {
            return (this.pk == null)
                ? null : this._route + '/' + this.pk;
        }
    });
    ResourceModel.prototype.fetch = function (cb) {
        if (this.pk == null) return null;
        $.get(this.uri, {}, cb, 'json');
    };
    ResourceModel.prototype.push = function (cb) {
        $.post(this._route, this._data, function (data, textStatus, jqXHR) {
            this._data = data;
            this._changes = 0;
            if (cb) cb(data, textStatus, jqXHR);
        }, 'json');
    };
    ResourceModel.prototype.pull = function (cb) {
        this.fetch(function (data, textStatus, jqXHR) {
            this._data = data;
            this._changes = 0;
            if (cb) cb(data, textStatus, jqXHR);
        });
    };

    return ResourceModel;
});
