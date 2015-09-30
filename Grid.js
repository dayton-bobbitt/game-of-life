// Copyright 2015 Dayton Bobbitt

var Grid = function() {
	// Initialize with default values
	this.size = 20;
	this.r = 1;
	this.l = 2;
	this.o = 3;
	this.gmin = 3;
	this.gmax = 3;
};

///////////////////////////////////////////////
// Setters and validators for GoL parameters //
///////////////////////////////////////////////
Grid.prototype.set_size = function(size) {
	if (this.valid_size(size)) this.size = size;
};

Grid.prototype.valid_size = function(size) {
	return size >= 20 && size <= 200;
};

Grid.prototype.set_r = function(r) {
	if (this.valid_r(r)) this.r = r;
};

Grid.prototype.valid_r = function(r) {
	return r > 0 && r <= 10;
};

Grid.prototype.set_l = function(l) {
	if (this.valid_l(l)) this.l = l;
};

Grid.prototype.valid_l = function(l) {
	return l > 0 && l <= this.o;
};

Grid.prototype.set_o = function(o) {
	if (this.valid_o(o)) this.o = o;
};

Grid.prototype.valid_o = function(o) {
	return o < 4*this.r*this.r + 4*this.r;
};

Grid.prototype.set_gmin = function(gmin) {
	if (this.valid_gmin(gmin)) this.gmin = gmin;
};

Grid.prototype.valid_gmin = function(gmin) {
	return gmin > 0 && gmin <= this.gmax;
};

Grid.prototype.set_gmax = function(gmax) {
	if (this.valid_gmax(gmax)) this.gmax = gmax;
};

Grid.prototype.valid_gmax = function(gmax) {
	return gmax < 4*this.r*this.r + 4*this.r;
};

/////////////////////////////////
// Game rules and update logic //
/////////////////////////////////
Grid.prototype.step = function() {
	var cell_state = this.get_cell_state;
	var alive_neighbor_count = this.get_alive_neighbor_count(cell_state);
};

// Populate matrix with 1s and 0s, representing alive and dead cells
Grid.prototype.get_cell_state = function() {
	var cells = this.build_matrix(this.size, this.size);
	$("td").each(function(index,cell) {
		var pos = this.get_cell_position($(cell).attr("id"));
		if ($(cell).hasClass("alive")) {
			cells[pos[0]][pos[1]] = 1;
		} else {
			cells[pos[0]][pos[1]] = 0;
		}
	});
};

// Populate matrix with number of alive neighbors - value at (r,c) represents alive neighbor count for cell (r,c)
Grid.prototype.get_alive_neighbor_count = function(cell_states) {
	var alive_neighbor_count = this.build_matrix(this.size, this.size);
	for (var r=0; r<this.size; r++) {
		for (var c=0; c<this.size; c++) {
			alive_neighbor_count[r][c] = this.count_alive_neighbors(cell_states, r,c);
		}
	}
};

Grid.prototype.count_alive_neighbors = function(states, row, col) {

};

Grid.prototype.kill = function(id) {
    this.update_cell_state(id,"dead");
};

Grid.prototype.revive = function(id) {
    this.update_cell_state(id,"alive");
};

Grid.prototype.flip_state = function(id) {
    if ($("#" + id).hasClass("alive")) this.update_cell_state(id,"dead");
    else this.update_cell_state(id,"alive");
};

Grid.prototype.update_cell_state = function(id,new_state) {
    var cell = $("#" + id);
    if (new_state === "dead") {
        // If cell previously alive, make next state 'was-alive', otherwise 'dead'
        if ($(cell).hasClass("alive")) $(cell).addClass("was-alive");
        else $(cell).addClass("dead");
        $(cell).removeClass("alive");
    } else {
        $(cell).removeClass();
        $(cell).addClass("alive");
    }
};

// Create empty 2d matrix
Grid.prototype.build_matrix = function(r,c) {
	var matrix = new Array(r);
	for (var i=0; i<r; i++) {
		matrix[i] = new Array(c);
	}
	return matrix;
};

// IDs of the form "r_c"
Grid.prototype.get_cell_position = function(id) {
	return id.split("_");
};


////////////////////////////////////////
// Logic for generating grid of cells //
////////////////////////////////////////

// Populate table with dead cells
Grid.prototype.reset = function() {
    $("td").each(function() {
        $(this).removeClass();
        $(this).addClass("dead");
    });
};

// Populate table with alive or dead cells
Grid.prototype.random = function() {
    $("td").each(function() {
        $(this).removeClass();
        $(this).addClass(random_state());
    });
};

var random_state = function() {
    if (Math.random() > 0.7) return "alive";
    return "dead";
};

Grid.prototype.draw = function() {
    for (var r=0; r<this.size; r++) {
        this.create_row(r);
        for (var c=0; c<this.size; c++) {
            this.create_cell(r,c);
        }
    }
    this.reset();
};

Grid.prototype.create_row = function(r) {
    var row = $("<tr></tr>").attr("id", "row_" + r);
	$("#grid").append(row);
};

Grid.prototype.create_cell = function(r,c) {
    var cell = $("<td></td>").attr("id", r + "_" + c);
    $("#row_" + r).append(cell);
};