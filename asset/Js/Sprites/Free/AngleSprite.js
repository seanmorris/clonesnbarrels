function AngleSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/angle_south.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/angle_west.png'
		]
		, 'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/angle_north.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/angle_east.png'
		]
	};

	this.standard = function()
	{
		return this.standing.north;
	}
}
