// Copyright 2015 Dayton Bobbitt

$(document).ready(function() {
	var grid = new Grid();
    grid.draw();
    grid.random();

    // Register click handler for cells
    $("body").on("click", "td", null, function(e) {
        if (e.shiftKey) grid.revive(e.target.id);
        else if (e.ctrlKey) grid.kill(e.target.id);
        else grid.flip_state(e.target.id);
    })
});

