var FireSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:fire_standing_south.png'
				, 'sprite:fire_standing_south2.png'
				, 'sprite:fire_standing_south3.png'
				, 'sprite:fire_standing_south4.png'
			]
			, 'west': [
				'sprite:fire_standing_west.png'
				, 'sprite:fire_standing_west2.png'
				, 'sprite:fire_standing_west3.png'
				, 'sprite:fire_standing_west4.png'
			]
			, 'north': [
				'sprite:fire_standing_north.png'
				, 'sprite:fire_standing_north2.png'
				, 'sprite:fire_standing_north3.png'
				, 'sprite:fire_standing_north4.png'
			]
			, 'east': [
				'sprite:fire_standing_east.png'
				, 'sprite:fire_standing_east2.png'
				, 'sprite:fire_standing_east3.png'
				, 'sprite:fire_standing_east4.png'
			]
		};

		this.walking = this.standing;

		this.standard = function()
		{
			return this.standing.west;
		}
	}
});
