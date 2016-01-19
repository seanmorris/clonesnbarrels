function BoxesSprite()
{
	this.standing = {
		'south': [
			'sprite:boxes.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
