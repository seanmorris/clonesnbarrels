function PlayerSprite()
{
	this.standing = {
		'north': [
			'sprite:player_standing_north.png'
		]
		, 'south': [
			'sprite:player_standing_south.png'
		]
		, 'west': [
			'sprite:player_standing_west.png'
		]
		, 'east': [
			'sprite:player_standing_east.png'
		]
	};

	this.walking = {
		'north': [
			'sprite:player_walking_north.png'
			, 'sprite:player_walking_north.png'
			, 'sprite:player_standing_north.png'
			, 'sprite:player_walking_north2.png'
			, 'sprite:player_walking_north2.png'
			, 'sprite:player_standing_north.png'
		]
		, 'south': [
			'sprite:player_walking_south.png'
			, 'sprite:player_walking_south.png'
			, 'sprite:player_standing_south.png'
			, 'sprite:player_walking_south2.png'
			, 'sprite:player_walking_south2.png'
			, 'sprite:player_standing_south.png'

		]
		, 'west': [
			'sprite:player_walking_west.png'
			, 'sprite:player_walking_west.png'
			, 'sprite:player_standing_west.png'
			, 'sprite:player_walking_west2.png'
			, 'sprite:player_walking_west2.png'
			, 'sprite:player_standing_west.png'
		]
		, 'east': [
			'sprite:player_walking_east.png'
			, 'sprite:player_walking_east.png'
			, 'sprite:player_standing_east.png'
			, 'sprite:player_walking_east2.png'
			, 'sprite:player_walking_east2.png'
			, 'sprite:player_standing_east.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
