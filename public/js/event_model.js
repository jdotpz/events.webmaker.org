define(['resource_model'], function (ResourceModel) {

    function EventModel(data) {
        this._data = data ? $.extend({}, data) : {};
    }
    EventModel.prototype = new ResourceModel('/events', [
        'title', 'description', 'address', 'latitude', 'longitude',
        'attendees', 'beginDate', 'beginTime', 'endDate', 'endTime',
        'registerLink', 'picture', 'organizer', 'created' ]);
    EventModel.prototype.constructor = EventModel;

    EventModel.prototype.datetimeHTML = function() {
        var bD = this.beginDate, eD = this.endDate,
            bT = this.beginTime, eT = this.endTime,
            icon = '<img class="calendar-icon" src="/img/map/calendar.png" />';
        function fmtRange(b, e) {
            var sep = (b && e ? ' - ' : '');
            return b || e ? '<div>' + b + sep + e + '</div>' : '';
        }
        if (!bD && !eD && !bT && !eT) return '';
        return '<div class="temporal-local">' + icon
            + '<div class="datetime-range">'
            +   fmtRange(bD, eD) + fmtRange(bT, eT)
            + '</div></div>';
    };
    EventModel.prototype.addressHTML = function() {
        if (!this.address) return '';
        var address_lines = this.address.split("\n");
        var icon = '<img class="pin-icon" src="/img/map/pin-event.png" />';
        return '<div class="temporal-local">' + icon
            + '<div class="address">' + address_lines.map(function (line) {
                return '<div>' + line + '</div>';
            }).join("\n") + '</div></div>';
    };
    EventModel.prototype.organizerHTML = function() {
        return '';
    };

    EventModel.prototype.popupHTML = function() {
        return '<div class="info-content">'
          + '<div class="info-title">' + this.title + '</div>'
          + '<div class="info-when-where">'
          + this.datetimeHTML()
          + this.addressHTML()
          + '<div class="info-description">' + this.description + '</div>'
          + this.organizerHTML()

            // show description button
          + '<a href="' + this.uri + '">'
          + '<span class="icon-stack icon-button-size info-button">'
                // XXX: change to span
              + '<i class="icon-sign-blank icon-stack-base icon-button-color"></i>'
              + '<i class="icon-chevron-right icon-light"></i>'
          + '</span></a></div>';
    };
    EventModel.all = function (cb) {
        var Model = this;
        $.getJSON(this._route, {}, function (data, textStatus, jqXHR) {
            if (!data.events) data.events = [];
            var collection = data.events.map(function (event) {
                return new Model(event);
            });
            if (cb) cb(collection, textStatus, jqXHR);
        });
    };

    return EventModel;
});