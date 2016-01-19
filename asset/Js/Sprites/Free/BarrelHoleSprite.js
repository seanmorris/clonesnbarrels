function BarrelHoleSprite()
{
	this.standing = {
		'south': [
			'sprite:barrel_hole.png'
		]
	};

	this.open = {
		'south': [
			'sprite:barrel_hole_open.png'
		]
	};

	this.opening = {
		'south': [
			'sprite:barrel_hole_opening.png'
			, 'sprite:barrel_hole_opening_2.png'
			, 'sprite:barrel_hole_opening_3.png'
		]
	};

	this.closing = {
		'south': [
			 'sprite:barrel_hole_opening_4.png'
			, 'sprite:barrel_hole_opening_3.png'
			, 'sprite:barrel_hole_opening_2.png'
			, 'sprite:barrel_hole_opening.png'
		]
	};

	this.sealing = {
		'south': [
			'sprite:barrel_hole.png'
			, 'sprite:barrel_hole_sealing.png'
			, 'sprite:barrel_hole_sealing_2.png'
			, 'sprite:barrel_hole_sealing_3.png'
			, 'sprite:barrel_hole.png'
			, 'sprite:barrel_hole_sealing.png'
			, 'sprite:barrel_hole_sealing_2.png'
			, 'sprite:barrel_hole_sealing_3.png'
			, 'sprite:barrel_hole.png'
			, 'sprite:barrel_hole_sealing.png'
			, 'sprite:barrel_hole_sealing_2.png'
			, 'sprite:barrel_hole_sealing_3.png'
			, 'sprite:barrel_hole.png'
			, 'sprite:barrel_hole_sealing.png'
			, 'sprite:barrel_hole_sealing_2.png'
		]
	}

	this.sealed = {
		south: [
			'sprite:barrel_hole_sealing_2.png'
		]
	}

	this.standard = function()
	{
		return this.standing.south;
	}
}
