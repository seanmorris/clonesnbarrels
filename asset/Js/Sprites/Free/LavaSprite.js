function LavaSprite()
{
	this.standing = {
		'south': [
			'sprite:lava_center_middle.png'
		]
		, 'top': [
			'sprite:lava_top_middle.png'
		]
		, 'bottom': [
			'sprite:lava_bottom_middle.png'
		]
		, 'left': [
			'sprite:lava_center_left.png'
		]
		, 'right': [
			'sprite:lava_center_right.png'
		]
		, 'topLeft': [
			'sprite:lava_top_left.png'
		]
		, 'bottomLeft': [
			'sprite:lava_bottom_left.png'
		]
		, 'topRight': [
			'sprite:lava_top_right.png'
		]
		, 'bottomRight': [
			'sprite:lava_bottom_right.png'
		]
	};

	this.cold = {
		'south': [
			'sprite:lava_cold_center_middle.png'
		]
		, 'top': [
			'sprite:lava_cold_top_middle.png'
		]
		, 'bottom': [
			'sprite:lava_cold_bottom_middle.png'
		]
		, 'left': [
			'sprite:lava_cold_center_left.png'
		]
		, 'right': [
			'sprite:lava_cold_center_right.png'
		]
		, 'topLeft': [
			'sprite:lava_cold_top_left.png'
		]
		, 'bottomLeft': [
			'sprite:lava_cold_bottom_left.png'
		]
		, 'topRight': [
			'sprite:lava_cold_top_right.png'
		]
		, 'bottomRight': [
			'sprite:lava_cold_bottom_right.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
