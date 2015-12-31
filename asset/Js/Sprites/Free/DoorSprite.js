function DoorSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/door_closed.png'
		]
	};

	this.open = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/door_opened.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
