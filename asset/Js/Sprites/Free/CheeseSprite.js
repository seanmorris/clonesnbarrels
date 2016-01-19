function CheeseSprite()
{
	this.standing = {
		'south': [
			'sprite:cheese.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
