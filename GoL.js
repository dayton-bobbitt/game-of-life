// Copyright 2015 Dayton Bobbitt

$(document).ready(function() {
    // Initialize parameters with defaults
    var parameters = {"r": 1, "l": 2, "o": 3, "gmin": 3, "gmax": 3, "delay": 200};
    var paused = false;

    // Repeatedly step through simulation with parameters["delay"] amount of time between steps
    var play = function() {
        if (!paused) {
            grid.step();
            setTimeout(play,parameters["delay"]);
        }
    };

    populate_dropdowns(parameters);
	var grid = new Grid();
    grid.draw();
    play();


    ////////////////////
    // Event Handlers //
    ////////////////////

    // Register click handler for cells
    $("body").on("click", "td", null, function(e) {
        if (e.shiftKey) grid.revive(e.target.id);
        else if (e.ctrlKey) grid.kill(e.target.id);
        else grid.flip_state(e.target.id);
    });

    // Generate random cell arrangement on button press
    $("#btn-random").on("click", function() {
        grid.random();
    });

    // Clear grid (force all cells to be dead state)
    $("#btn-reset").on("click", function() {
        grid.reset();
    });

    // Play/pause simulation
    $("#btn-pause").on("click", function() {
        if (paused) {
            paused = false;
            $(this).text("Pause");
            play();
        } else {
            paused = true;
            $(this).text("Resume");
        }
    });

    // Update state of cells by applying rules one time
    $("#btn-step").on("click", function() {
        grid.step();
    });

    /*
     * Resize grid
     * Increasing size will maintain all cell state
     * Decreasing size will maintain state of cells that fit within the new grid
     */
    $("#grid-size-slider").on("change", function() {
        // Get slider value
        grid.set_size(+$(this).val());
    });

    // Change amount of delay between steps
    $("#delay-slider").on("change", function() {
        var delay = +$(this).val();
        if (valid_delay(delay)) parameters["delay"] = delay;
    });

    // Control state of cells that fall outside of grid
    $("#select-cell-state").on("click", function() {
        grid.set_outside_cell_state($(this).val());
    });


    // Set neighbor radius
    $("#select-r").on("change", function() {
        parameters["r"] = +$(this).val();
        grid.set_r(parameters["r"]);
        populate_dropdowns(parameters);
    });

    // Set loneliness threshold
    $("#select-l").on("change", function() {
        parameters["l"] = +$(this).val();
        grid.set_r(parameters["l"]);
    });

    // Set overpopulation threshold
    $("#select-o").on("change", function() {
        parameters["o"] = +$(this).val();
        grid.set_o(parameters["o"]);
        update_l_dropdown(parameters);
    });

    // Set generation min
    $("#select-gmin").on("change", function() {
        parameters["gmin"] = +$(this).val();
        grid.set_gmin(parameters["gmin"]);
    });

    // Set generation max
    $("#select-gmax").on("change", function() {
        parameters["gmax"] = +$(this).val();
        grid.set_gmax(parameters["gmax"]);
        update_gmin_dropdown(parameters);
    });

    // Test to get dynamically changing sizes
    // Should be able to scale the page to whatever size display its on (min width height 600 but will grow larger
    // This dynamic sizing will be its own class
    /*$("h3").on("click", function() {
        var grid = $("#grid");
        var panel = $("#main-panel");
        $(grid).css("width", 800);
        $(grid).css("height", 800);
        $(panel).css("width", 800);
        $(panel).css("height", 800);
    });*/
});

var valid_delay = function(delay) {
    return delay > 0 && delay <= 1000;
};

var populate_dropdowns = function(parameters) {
    reset_dropdowns();
    populate_r_dropdown(parameters["r"]);
    populate_l_dropdown(parameters["o"],parameters["l"]);
    populate_o_dropdown(parameters["r"],parameters["o"]);
    populate_gmin_dropdown(parameters["gmax"],parameters["gmin"]);
    populate_gmax_dropdown(parameters["r"],parameters["gmax"]);
};

var populate_r_dropdown = function(current_r) {
    // Valid r range from 1 to 10
    var max_r = 10;
    populate_dropdown("select-r",max_r,current_r);
};

var populate_l_dropdown = function(o,current_l) {
    var max_l = o;
    populate_dropdown("select-l",max_l,current_l);
};

var update_l_dropdown = function(parameters) {
    empty_dropdown("select-l");
    populate_l_dropdown(parameters["o"],parameters["l"]);
};

var populate_o_dropdown = function(r,current_o) {
    var max_o = 4*r*r + 4*r - 1;
    populate_dropdown("select-o",max_o,current_o);
};

var populate_gmin_dropdown = function(gmax,current_gmin) {
    var max_gmin = gmax;
    populate_dropdown("select-gmin",max_gmin,current_gmin);
};

var update_gmin_dropdown = function(parameters) {
    empty_dropdown("select-gmin");
    populate_gmin_dropdown(parameters["gmax"],parameters["gmin"]);
};

var populate_gmax_dropdown = function(r,current_gmax) {
    var max_gmax = 4*r*r + 4*r - 1;
    populate_dropdown("select-gmax",max_gmax,current_gmax)
};

var populate_dropdown = function(list_id,item_count,selected_value) {
    for (var i=1; i <= item_count; i++) {
        $("#" + list_id).append(add_option(i,i == selected_value));
    }
};

var add_option = function(i,selected) {
    var li = $("<option></option>");
    $(li).attr("value", i);
    $(li).text(i);
    if (selected) $(li).attr("selected", "selected");
    return li;
};

var reset_dropdowns = function() {
    empty_dropdown("select-r");
    empty_dropdown("select-l");
    empty_dropdown("select-o");
    empty_dropdown("select-gmin");
    empty_dropdown(("select-gmax"));
};

var empty_dropdown = function(id) {
    $("#" + id).empty();
};
