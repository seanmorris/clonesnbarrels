function ButtonSprite()
{
	this.standing = {
		'south': [
			'sprite:button.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
