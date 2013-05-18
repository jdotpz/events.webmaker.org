load('application');

before(loadEvent, {
    only: ['show', 'edit', 'update', 'destroy']
    });

action('map', function () {
/*    render({ page: view, makeEndpoint: makeURL, personaSSO: personaSSO }); */
    layout(false);
    render();
});

action(function create() {
    Event.create(req.body.Event, function (err, event) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: event && event.errors || err});
                } else {
                    send({code: 200, data: event.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', 'Event can not be created');
                    render('new', {
                        event: event,
                        title: 'New event'
                    });
                } else {
                    flash('info', 'Event created');
                    redirect(path_to.events);
                }
            });
        });
    });
});

action(function index() {
    this.title = 'Events index';
    Event.all(function (err, events) {
        switch (params.format) {
            case "json":
                send({code: 200, data: events});
                break;
            default:
                render({
                    events: events
                });
        }
    });
});

action(function show() {
    this.title = 'Event show';
    switch(params.format) {
        case "json":
            send({code: 200, data: this.event});
            break;
        default:
            render();
    }
});

action(function edit() {
    this.title = 'Event edit';
    switch(params.format) {
        case "json":
            send(this.event);
            break;
        default:
            render();
    }
});

action(function update() {
    var event = this.event;
    this.title = 'Edit event details';
    this.event.updateAttributes(body.Event, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: event && event.errors || err});
                } else {
                    send({code: 200, data: event});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Event updated');
                    redirect(path_to.event(event));
                } else {
                    flash('error', 'Event can not be updated');
                    render('edit');
                }
            });
        });
    });
});

action(function destroy() {
    this.event.destroy(function (error) {
        respondTo(function (format) {
            format.json(function () {
                if (error) {
                    send({code: 500, error: error});
                } else {
                    send({code: 200});
                }
            });
            format.html(function () {
                if (error) {
                    flash('error', 'Can not destroy event');
                } else {
                    flash('info', 'Event successfully removed');
                }
                send("'" + path_to.events + "'");
            });
        });
    });
});

function loadEvent() {
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
}
