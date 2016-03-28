var SentinelSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'north': [
				'sprite:sentinel_standing_north.png'
			]
			, 'south': [
				'sprite:sentinel_standing_south.png'
			]
			, 'west': [
				'sprite:sentinel_standing_west.png'
			]
			, 'east': [
				'sprite:sentinel_standing_east.png'
			]
		};

		this.walking = {
			'north': [
				'sprite:sentinel_standing_north.png'
				, 'sprite:sentinel_walking_north.png'
				, 'sprite:sentinel_standing_north.png'
				, 'sprite:sentinel_walking_north_2.png'
			]
			, 'south': [
				'sprite:sentinel_standing_south.png'
				, 'sprite:sentinel_walking_south.png'
				, 'sprite:sentinel_walking_south.png'
				, 'sprite:sentinel_standing_south.png'
				, 'sprite:sentinel_walking_south_2.png'
				, 'sprite:sentinel_walking_south_2.png'

			]
			, 'west': [
				'sprite:sentinel_standing_west.png'
				, 'sprite:sentinel_walking_west.png'
				, 'sprite:sentinel_standing_west.png'
				, 'sprite:sentinel_walking_west_2.png'
			]
			, 'east': [
				'sprite:sentinel_standing_east.png'
				, 'sprite:sentinel_walking_east.png'
				, 'sprite:sentinel_standing_east.png'
				, 'sprite:sentinel_walking_east_2.png'
			]
		};
	}
});
