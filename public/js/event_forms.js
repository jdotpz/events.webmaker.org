define(['jquery', 'event_model'],
function ($, EventModel) {
    $(document).ready(function () {
        var create_form = $('form#create-event');
        var file_input = create_form.find('input[type="file"]');
        var upload_div = create_form.find('#image-upload');
        upload_div.on("click", function(ev) {
            ev.preventDefault();
            file_input.click();
        }).on("dragenter dragover drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }).on("drop", function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            handleImg(ev.dataTransfer.files[0]);
        });
        file_input.on("change", function (ev) {
            handleImg(this.files[0]);
        });
        // based on MDN example
        function handleImg(file) {
            if (file.type.match(/image.*/)) {
                upload_div.html("<img />");
                var img = upload_div.find("img")[0];
                img.file = file;

                var reader = new FileReader();
                reader.onload = (function(img) {
                    return function(ev) {
                        img.src = ev.target.result;
                        $('.upload input[name="picture"]')[0].value = img.src;
                    };
                })(img);
                reader.readAsDataURL(file);
            }
        }
        create_form.find('button[type="submit"]').click(function (ev) {
            ev.preventDefault();
            create_form.submit();
        });
        create_form.on("submit", function(ev) {
            ev.preventDefault();
            var form_fields = create_form.serializeArray();
            var data = {};
            form_fields.forEach(function (f) {
                if (f.name)
                    data[f.name] = f.value;
            });
            console.log(data);
            $.post(create_form.attr('action'), data, function(data) {
                console.log(data); // TODO: pin event on map
                // API: pin-event, clear-pins, popup-event
            }, 'json');
            return false;
        });
        // setup form toggle button
        $("h2.formExpandButton").click(function(ev) {
            ev.preventDefault();
            create_form.toggleClass('toggleHidden');
            $("#add-event-button").toggleClass('toggleHidden');
        });
    });
})
