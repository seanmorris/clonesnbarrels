var AngleSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:angle_south.png'
			]
			, 'west': [
				'sprite:angle_west.png'
			]
			, 'north': [
				'sprite:angle_north.png'
			]
			, 'east': [
				'sprite:angle_east.png'
			]
		};

		this.standard = function()
		{
			return this.standing.north;
		}
	}
});
