function PlayerSprite()
{
	this.standing = {
		'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_standing_north.png'
		]
		, 'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_standing_south.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_standing_west.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_standing_east.png'
		]
	};

	this.walking = {
		'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_walking_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_north2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_north2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_north.png'
		]
		, 'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_walking_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_south2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_south2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_south.png'

		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_walking_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_west2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_west2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_west.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_walking_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_east2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_walking_east2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/player_standing_east.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
