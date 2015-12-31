function FireSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/fire_standing_south.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_south2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_south3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_south4.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/fire_standing_west.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_west2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_west3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_west4.png'
		]
		, 'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/fire_standing_north.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_north2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_north3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_north4.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/fire_standing_east.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_east2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_east3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/fire_standing_east4.png'
		]
	};

	this.walking = this.standing;

	this.standard = function()
	{
		return this.standing.west;
	}
}
