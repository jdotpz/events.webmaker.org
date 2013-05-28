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
    var event = req.body.event;
    if (event) {
        [ 'begin', 'end' ].map(function (f) {
            var df = f + 'Date';
            event[df] = event[df] ? new Date(event[df].split('-')) : null;
            if (event[df] == "Invalid Date")
                event[df] = null;

            var tf = f + 'Time';
            var ts = event[tf].split(':');
            event[tf] = event[tf] ? new Date(0,0,0,ts[0],ts[1]) : null;
            if (event[tf] == "Invalid Date")
                event[tf] = null;
        });
    }
    Event.create(event, function (err, event) {
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
        else resFmt({
            json: function () { res.send(200, event) },
            html: function () {
                function fmtDate(x) { return new Date(x).toDateString() }
                function fmtTime(x) { return new Date(x).toTimeString().split(' ')[0] }
                var evt = {};
                for (var p in event) switch(p) {
                    case 'beginDate':
                    case 'endDate':
                        evt[p] = fmtDate(event[p]);
                        break;
                    case 'beginTime':
                    case 'endTime':
                        evt[p] = fmtTime(event[p]);
                        break;
                    default:
                        evt[p] = event[p];
                }
                subpage('details', { event: evt });
            }
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
