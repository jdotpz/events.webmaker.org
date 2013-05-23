load('application');

function resFmt(fmts) {
    // Optional Content-Type override via 'format' query-parameter.
    var fmt = req.param('format');
    if (fmt && fmts[fmt])
        return fmts[fmt]();
    return res.format(fmts);
}
function _subpage(subpage, data) {
    data.page    = 'events';
    data.subpage = subpage;
    render(subpage, data);
}

// CREATE
action(function create() {
    Event.create(req.body.event, function (err, event) {
        resFmt({
            json: function () {
                if (err)
                    res.send(500, { error: event && event.errors || err });
                else
                    res.send(200, event);
            },
        })
    })
});

// LIST/FILTER
action(function index() {
    Event.all(function (err, events) {
        resFmt({
            json: function () {
                res.send(200, events);
            },
            html: function () {
                _subpage('map', { events: events });
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
                    res.send(404, { error: 'Not found' });
                else
                    res.send(200, event);
            },
            html: function () {
                if (err || !event)
                    redirect(path_to.events);
                _subpage('details', { event: event });
            }
        })
    });
});
