function LaserBeamSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/laser_vert.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/laser.png'
		]
		, 'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/laser_vert.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/laser.png'
		]
	};

	this.standard = function()
	{
		return this.standing.west;
	}
}
