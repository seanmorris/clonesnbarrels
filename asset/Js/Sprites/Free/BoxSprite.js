function BoxSprite()
{
	this.standing = {
		'south': [
			'sprite:box.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
