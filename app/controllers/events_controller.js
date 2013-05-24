load('application');


var page  = 'events',
    model = 'event';


// TODO: allow filtering using query-string
action(function index() {
    Event.all(function (err, events) {
        resFmt({
            json: function () {
                res.send(200, { events: events });
            },
            html: function () {
                subpage('map', { events: events });
            }
        })
    });
});
action(function create() {
    Event.create(req.body, function (err, event) {
        if (err || !event)
            reply(500, 'Could not create Event', { error: event && event.errors || [err] });
        else
            reply(200, 'Event created', { event: event });
    })
});
action(function details() {
    Event.find(params.id, function (err, event) {
        if (err || !event)
            reply(404, 'Event not found');
        else
        resFmt({
            json: function () { res.send(200, event) },
            html: function () { subpage('details', { event: event }) }
        });
    });
});
action(function update() {
    Event.find(params.id, function (err, event) {
        if (err || !event)
            reply(404, 'Event not found');
        else event.updateAttributes(params.id, function () {
            reply(200, 'Event updated', { event: event });
        });
    });
});
action(function destroy() {
    Event.find(params.id, function (err, event) {
        if (err || !event)
            reply(404, 'Event not found');
        else event.destroy(function () {
            reply(200, 'Event deleted');
        });
    });
});


/* Helper functions */  // TODO: move helpers into application controller

function resFmt(fmts) {
    // Optional Content-Type override via 'format' query-parameter.
    var fmt = req.param('format');
    if (fmt && fmts[fmt])
        return fmts[fmt]();
    return res.format(fmts);
};
function subpage(subpage, data) {
    data.page    = page;
    data.subpage = subpage;
    render(subpage, data);
};
function reply(code, msg, obj) {
    var isError = code >= 400;
    resFmt({
        json: function () {
            if (!obj) obj = isError ? { error: msg } : { msg: msg };
            res.send(code, obj);
        },
        html: function () {
            if (msg) flash(isError ? 'error' : 'info', msg);
            redirect(obj && obj[model] ? path_to[model](obj[model].id)
                                       : path_to[page]);
        },
    });
};
