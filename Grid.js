// Copyright 2015 Dayton Bobbitt

// STEP BACK??? STACK OF LAST X CELL_STATES!!!

var Grid = function() {
	// Initialize with default values
	this.size = 20;
    this.outside_cell_state = "dead";
	this.r = 1;
	this.l = 2;
	this.o = 3;
	this.gmin = 3;
	this.gmax = 3;
    this.grid_drawn = false;
};

///////////////////////////////////////////////
// Setters and validators for GoL parameters //
///////////////////////////////////////////////
Grid.prototype.set_size = function(size) {
	if (this.valid_size(size)) {
        if (this.grid_drawn && size != this.size) {
            var old_size = this.size;
            var state = this.get_cell_state();  // Current state of cells before expanding grid
            this.size = size;
            this.reset();
            if (size > old_size) {
                this.expand_grid(state);
            } else {
                this.shrink_grid(state);
            }
            // Do nothing if new size is equal to old size
        } else {
            // If a grid hasn't been drawn, simply change the parameter
            this.size = size;
        }
    }
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
        var r = pos[0];
        var c = pos[1];
		if (cell_alive(cell)) {
			cells[r][c] = 1;
		} else if (cell_was_alive(cell)) {
            cells[r][c] = 2;
        } else {
			cells[r][c] = 0;
		}
	});
    return cells;
};

var cell_alive = function(cell) {
    return $(cell).hasClass("alive");
};

var cell_was_alive = function(cell) {
    return $(cell).hasClass("was-alive");
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
                if (states[r][c] == 1) count++;
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

Grid.prototype.was_alive = function(id) {
    this.change_cell_state(id,"was-alive");
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
    } else if (new_state === "alive") {
        $(cell).removeClass();
        $(cell).addClass("alive");
    } else {
        $(cell).removeClass();
        $(cell).addClass("was-alive");
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
    var alive_threshold = Math.random() * 0.4 + 0.5;    // Random value between 0.5 and 0.9
    $("td").each(function() {
        $(this).removeClass();
        $(this).addClass(random_state(alive_threshold));
    });
};

var random_state = function(alive_threshold) {
    if (Math.random() > alive_threshold) return "alive";
    return "dead";
};

Grid.prototype.draw = function() {
    for (var r=0; r<this.size; r++) {
        this.build_row(r);
    }
    this.grid_drawn = true;
    this.random();
};

Grid.prototype.expand_grid = function(state) {
    for (var r=0; r < this.size; r++) {
        var old_size = state.length;
        // Expand columns of existing rows by this.size - old_size cells
        if (r < old_size) this.expand_row(r, old_size);
        else {
            this.build_row(r);
        }
    }
    this.reset();
    this.redraw_state(state);
};

Grid.prototype.expand_row = function(r,old_grid_right_side) {
    for (var c=old_grid_right_side; c < this.size; c++) {
        this.create_cell(r,c);
    }
};

/*
 * Apply states provided in matrix "state" to cells
 * If "state.length" larger than current grid size, cells in the center
 *      of "state" that fall within the current grid are applied
 * If "state.length" smaller than current grid size, the states
 *      in "state" are applied to a matrix equaling the size of "state" centered within the grid
 * If "state.length" equals the current grid size, states are mapped to grid cells (1:1 mapping)
 */
Grid.prototype.redraw_state = function(state) {
    var start_pos = Math.floor(this.size/2 - state.length/2 + 0.5);
    var stop_pos = start_pos + state.length;
    for (var r=start_pos, old_r=0; r<stop_pos; r++, old_r++) {
        // r and c can be less than zero if the state matrix being applied is larger than the current grid
        if (r >= 0) {
            for (var c=start_pos, old_c=0; c<stop_pos; c++, old_c++) {
                if (c >= 0) {
                    this.apply_state_to_cell(r,c,state[old_r][old_c]);
                }
            }
        }
    }
};

Grid.prototype.apply_state_to_cell = function(r,c,state) {
    var cell = cell_id(r,c);
    if (state == 1) this.revive(cell);
    else if (state == 2) this.was_alive(cell);
    else this.kill(cell);
};

// Reduce grid size - maintain state of the cells in the center of current grid that fit within the new grid
Grid.prototype.shrink_grid = function(state) {
    var old_size = state.length;
    // Remove rows and columns no longer needed
    for (var r=0; r<old_size; r++) {
        if (r < this.size) this.shrink_row(r,old_size);
        else this.remove_row(r);
    }
    this.redraw_state(state);
};

// Remove cells from rows that no longer fit within the grid
Grid.prototype.shrink_row = function(r,old_grid_bottom) {
    for (var c=this.size; c<old_grid_bottom; c++) {
        this.remove_cell(r,c);
    }
};

Grid.prototype.remove_row = function(r) {
    $("#row_" + r).remove();
};

Grid.prototype.remove_cell = function(r,c) {
    $("#" + cell_id(r,c)).remove();
};

// Create new row r and fill with cells
Grid.prototype.build_row = function(r) {
    this.create_row(r);
    this.fill_row(r);
};

// Fill row r with cells
Grid.prototype.fill_row = function(r) {
    for (var c=0; c<this.size; c++) {
        this.create_cell(r,c);
    }
};

Grid.prototype.create_row = function(r) {
    var row = $("<tr></tr>").attr("id", "row_" + r);
	$("#grid").append(row);
};

Grid.prototype.create_cell = function(r,c) {
    var cell = $("<td></td>").attr("id", cell_id(r,c));
    $("#row_" + r).append(cell);
};