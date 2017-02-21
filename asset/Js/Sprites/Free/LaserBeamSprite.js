var LaserBeamSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:laser_vert.png'
			]
			, 'west': [
				'sprite:laser.png'
			]
			, 'north': [
				'sprite:laser_vert.png'
			]
			, 'east': [
				'sprite:laser.png'
			]
		};

		this.standard = function()
		{
			return this.standing.west;
		}
	}
});
