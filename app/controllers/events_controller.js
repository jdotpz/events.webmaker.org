load('application');
layout(false);


action('map', function () {
    render({ dummy: new Event() });
});
action('list', function () {
    render({ dummy: new Event() });
});

function guessFmt() {
    // TODO: check Content-Type header
    return params.format
}

// CREATE
action(function create() {
    Event.create(req.body, function (err, event) {
        switch (guessFmt()) {
            case "json":
                if (err) {
                    send({code: 500, error: event && event.errors || err});
                } else {
                    send({code: 200, data: event.toObject()});
                }
                break;
            default:
                if (err) {
                    flash('error', 'Event could not be created');
                    render('new', { event: event,
                                    title: 'New event' });
                } else {
                    flash('info', 'Event created');
                    redirect(path_to.events);
                }
        }
    });
});

// LIST/FILTER
action(function index() {
    Event.all(function (err, events) {
        switch (guessFmt()) {
            case "json":
                send({code: 200, data: events});
                break;
            default:
                render('map', { title: 'Events Listing',
                                events: events });
        }
    });
});

// DETAILS
action(function show() {
    console.log(params.format);
    switch (guessFmt()) {
        case "json":
            send({code: 200, data: this.event});
            break;
        default:
            render({ title: 'Event Details' });
    }
});

before(function loadEvent() {
    Event.find(params.id, function (err, event) {
        if (err || !event) {
            if (!err && !event && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.events);
        } else {
            this.event = event;
            next();
        }
    }.bind(this));
}, { only: ['show'] });
