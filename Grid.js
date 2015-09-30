// Copyright 2015 Dayton Bobbitt

var Grid = function() {
	// Initialize with default values
	this.size = 20;
    this.outside_cell_state = "dead";
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

Grid.prototype.set_outside_cell_state = function(state) {
    if (this.valid_outside_cell_state(state)) this.outside_cell_state = state;
};

Grid.prototype.valid_outside_cell_state = function(state) {
    return state === "alive" || state === "dead" || state === "toroidal";
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
	var cell_state = this.get_cell_state();
	this.update_cell_states(cell_state);
};

// Populate matrix with 1s and 0s, representing alive and dead cells
Grid.prototype.get_cell_state = function() {
	var cells = this.build_matrix(this.size, this.size);
	$("td").each(function(index,cell) {
		var pos = get_cell_position($(cell).attr("id"));
		if (cell_alive(cell)) {
			cells[pos[0]][pos[1]] = 1;
		} else {
			cells[pos[0]][pos[1]] = 0;
		}
	});
    return cells;
};

var cell_alive = function(cell) {
    return $(cell).hasClass("alive");
};

// Count number of alive neighbors for each cell and update cell state based on that value
Grid.prototype.update_cell_states = function(cell_states) {
	for (var r=0; r<this.size; r++) {
		for (var c=0; c<this.size; c++) {
			var alive_neighbor_count = this.count_alive_neighbors(cell_states,r,c);
            var cell_alive = cell_states[r][c] == 1;
            this.update_cell_state(alive_neighbor_count,cell_alive,r,c);
		}
	}
};

Grid.prototype.count_alive_neighbors = function(states, row, col) {
    var count = 0;

    // Loop over subset of cells within radius this.r of the cell
    for (var r = row - this.r; r <= row + this.r; r++) {
        for (var c = col - this.r; c <= col + this.r; c++) {
            if (this.pointOutsideGrid(r,c)) {
                count += this.checkOutsideNeighbor(r,c);
            } else if (r != row || c != col) {
                // states is matrix of 1s and 0s, representing alive and dead cells
                count += states[r][c];
            }
        }
    }
    return count;
};

// Update specific cell state based on number of alive neighbors
Grid.prototype.update_cell_state = function(count,alive,r,c) {
    if (alive) {
        if (count < this.l || count > this.o) {
            this.kill(cell_id(r,c));
        }
    } else {
        if (count >= this.gmin && count <= this.gmax) {
            this.revive(cell_id(r,c));
        }
    }
};

Grid.prototype.pointOutsideGrid = function(i,j) {
    return i < 0 || i >= this.size || j < 0 || j >= this.size;
};

// Handle the state of neighbors outside the matrix
Grid.prototype.checkOutsideNeighbor = function(r,c) {
    if (this.outside_cell_state === 'dead') {
        return 0;
    } else if (this.outside_cell_state === 'alive') {
        return 1;
    } else {
        r = this.wrap(r);
        c = this.wrap(c);
        var cell = $("#" + cell_id(r,c));
        if (cell_alive(cell)) return 1;
        return 0;
    }
};

// Wrap index to the other side of matrix - used with "toroidal" state
Grid.prototype.wrap = function(i) {
    i %= this.size;
    while (i < 0) i += this.size;
    return i;
};

Grid.prototype.kill = function(id) {
    this.change_cell_state(id,"dead");
};

Grid.prototype.revive = function(id) {
    this.change_cell_state(id,"alive");
};

Grid.prototype.flip_state = function(id) {
    if ($("#" + id).hasClass("alive")) this.change_cell_state(id,"dead");
    else this.change_cell_state(id,"alive");
};

Grid.prototype.change_cell_state = function(id,new_state) {
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
var get_cell_position = function(id) {
	return id.split("_");
};

// Get cell ID from position
var cell_id = function(r,c) {
    return r + "_" + c;
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
    this.random();
};

Grid.prototype.create_row = function(r) {
    var row = $("<tr></tr>").attr("id", "row_" + r);
	$("#grid").append(row);
};

Grid.prototype.create_cell = function(r,c) {
    var cell = $("<td></td>").attr("id", r + "_" + c);
    $("#row_" + r).append(cell);
};