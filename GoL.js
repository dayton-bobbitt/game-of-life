// Copyright 2015 Dayton Bobbitt

$(document).ready(function() {
	var grid = new Grid();
    grid.draw();

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

    // Update state of cells by applying rules one time
    $("#btn-step").on("click", function() {
       grid.step();
    });
});

