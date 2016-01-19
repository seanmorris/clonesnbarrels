function DoorSprite()
{
	this.standing = {
		'south': [
			'sprite:door_closed.png'
		]
	};

	this.open = {
		'south': [
			'sprite:door_opened.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
