load('application');

action(function profile() {
    this.loginAPI.getUser(req.session.email, function(err, user) {
        res.json(
            (err || !user) ? {
                status: "failed",
                reason: (err || "user not defined")
            } : {
                status: "okay",
                user: user
            }
        );
    });
});
