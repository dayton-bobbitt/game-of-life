// Copyright 2015 Dayton Bobbitt

var Grid = function() {
	// Initialize with default values
	this.size = 20;
	this.r = 1;
	this.l = 2;
	this.o = 3;
	this.gmin = 3;
	this.gmax = 3;
}


// Setters and validators for GoL parameters

Grid.prototype.set_size = function(size) {
	if (this.valid_size(size)) this.size = size;
}

Grid.prototype.valid_size = function(size) {
	return size >= 20 && size <= 200;
}

Grid.prototype.set_r = function(r) {
	if (this.valid_r(r)) this.r = r;
}

Grid.prototype.valid_r = function(r) {
	return r > 0 && r <= 10;
}

Grid.prototype.set_l = function(l) {
	if (this.valid_l(l)) this.l = l;
}

Grid.prototype.valid_l = function(l) {
	return l > 0 && l <= o;
}

Grid.prototype.set_o = function(o) {
	if (this.valid_o(o)) this.o = o;
}

Grid.prototype.valid_o = function(o) {
	return o < 4*this.r*this.r + 4*this.r;
}

Grid.prototype.set_gmin = function(gmin) {
	if (this.valid_gmin(gmin)) this.gmin = gmin;
}

Grid.prototype.valid_gmin = function(gmin) {
	return gmin > 0 && gmin <= this.gmax;
}

Grid.prototype.set_gmax = function(gmax) {
	if (this.valid_gmax(gmax)) this.gmax = gmax;
}

Grid.prototype.valid_gmax = function(gmax) {
	return gmax < 4*this.r*this.r + 4*this.r;
}


// Game rules and update logic

Grid.prototype.step = function() {
	var cell_state = this.get_cell_state;
	var alive_neighbor_count = this.get_alive_neighbor_count(cell_state);
}

// Populate matrix with 1s and 0s, representing alive and dead cells
Grid.prototype.get_cell_state = function() {
	var cells = this.build_matrix(this.size);
	$("td").each(function(index,cell) {
		var pos = this.get_cell_position($(cell).attr("id"));
		if ($(cell).hasClass("alive")) {
			cells[pos[0]][pos[1]] = 1;
		} else {
			cells[pos[0]][pos[1]] = 0;
		}
	});
}

// Populate matrix with number of alive neighbors - value at (r,c) represents alive neighbor count for cell (r,c)
Grid.prototype.get_alive_neighbor_count = function(cell_state) {
	
}

Grid.prototype.build_matrix = function(r,c) {
	var matrix = new Array(r);
	for (i=0; i<r; i++) {
		matrix[i] = new Array(c);
	}
	return matrix;
}

// IDs of the form "r_c"
Grid.prototype.get_cell_position = function(id) {
	return id.split("_");
}