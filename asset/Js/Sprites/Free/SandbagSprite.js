function SandbagSprite()
{
	this.standing = {
		'south': [
			'sprite:sandbag.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
