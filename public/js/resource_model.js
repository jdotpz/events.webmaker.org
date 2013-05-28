define(['jquery'], function ($) {

    function ResourceModel(o) {
        var Model = function (data) {
            this._data  = data ? $.extend({}, data) : {};
            this._initFields();
        };
        Model._name   = o.name;
        Model._plural = o.plural || (Model._name + 's');
        Model._uri    = o.route  || ('/' + Model._plural);
        Model._pk     = o.pk || 'id';

        if (o.fields instanceof Array) {
            Model._fields = {};
            o.fields.forEach(function (field) {
                Model._fields[field] = {
                    get: function () { return this._data[field] }, 
                    set: function (val) { this._data[field] = val; },
                };
            }, this);
        } else {
            Model._fields = o.fields;
        }
        Model.prototype._initFields = function () {
            for (var field in Model._fields)
                Object.defineProperty(this, field, Model._fields[field]);
        };

        Object.defineProperty(Model.prototype, '_pk', {
            get: function () {
                return (!this._data || this._data[Model._pk] == undefined)
                    ? null : this._data[Model._pk];
            }
        });
        Object.defineProperty(Model.prototype, '_uri', {
            get: function () {
                return (this._pk == null)
                    ? null : Model._uri + '/' + this._pk;
            }
        });

        Model.prototype._ajax = function (method, uri, data, hooks, pre_hook, post_hook) {
            var self = this;
            var json_mime = 'application/json';
            $.ajax(uri, { type: method, data: data, dataType: 'json',
                accepts: json_mime, contentType: json_mime })
             .done(function (data) {
                var name = Model._name;
                var run_hooks = pre_hook ? false === pre_hook.call(Model, data[name]) : true;
                if (data[name])
                    self._data = data[name];
                if (run_hooks) hooks.forEach(function (hook) {
                    hook.call(Model, self);
                });
                if (post_hook) post_hook.call(Model, self);
            });
            return true;
        };
        Model.prototype.post = function (pre_hook, post_hook) {
            if (this._pk != null) return false;
            return this._ajax('post', Model._uri, this._data,
                    Model.prototype.post.hooks, pre_hook, post_hook);
        };
        Model.prototype.post.hooks = [];
        Model.prototype.pull = function (pre_hook, post_hook) {
            if (this._pk == null) return false;
            return this._ajax('get', this._uri, {},
                    Model.prototype.pull.hooks, pre_hook, post_hook);
        };
        Model.prototype.pull.hooks = [];
        Model.all = function (cb) {
            $.get(this._uri, {}, function (data, textStatus, jqXHR) {
                var plural = Model._plural;
                if (!data[plural]) data[plural] = [];
                var collection = data[plural].map(function (event) {
                    return new Model(event);
                });
                if (cb) cb(collection, textStatus, jqXHR);
            }, 'json');
        };

        return Model;
    }

    return ResourceModel;
});
