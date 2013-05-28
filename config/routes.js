exports.routes = function (map) {
    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
    //map.all(':controller/:action');
    //map.all(':controller/:action/:id');
    //map.resources('events');

    // Events CRUD
    map.get('/events.:format?',     'events#index');
    map.get('/events/:id.:format?', 'events#details');
    map.post('/events.:format?',    'events#create');
    //map.put('/events/:id.:format?', 'events#update');
    //map.delete('/events/:id.:format?', 'events#destroy');

    // Webmaker Persona SSO
    map.get("/user/:userid", 'users#profile');
    map.root('home#index');
};
