load('application');
layout(false);

before('set page name for template', function () {
    this.page = 'events';
    next();
});

function resFmt(fmts) {
    // Optional Content-Type override via 'format' query-parameter.
    var fmt = req.param('format');
    if (fmt && fmts[fmt])
        return fmts[fmt]();
    return res.format(fmts);
}
action('new', function () {
    render('create', { event: new Event() });
});
// CREATE
action(function create() {
    Event.create(req.body.event, function (err, event) {
        resFmt({
            json: function () {
                if (err) {
                    send({code: 500, error: event && event.errors || err});
                } else {
                    send({code: 200, data: event.toObject()});
                }
            },
            html: function () {
                if (err) {
                    flash('error', 'Event could not be created');
                    render('create', { event: event });
                } else {
                    flash('info', 'Event created');
                    redirect(path_to.events);
                }
            }
        })
    })
});

// LIST/FILTER
action(function index() {
    Event.all(function (err, events) {
        resFmt({
            json: function () {
                send({ code: 200, data: events });
            },
            html: function () {
                render('map', { title: 'Events Listing',
                                events: events });
            }
        })
    });
});

// DETAILS
action(function show() {
    Event.find(params.id, function (err, event) {
        resFmt({
            json: function () {
                if (err || !event)
                    return send({code: 404, error: 'Not found'});
                send({ code: 200, data: event });
            },
            html: function () {
                if (err || !event)
                    redirect(path_to.events);
                render({ title: 'Event Details' });
            }
        })
    });
});
