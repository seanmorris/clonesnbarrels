function BubbleSprite()
{
	this.standing = {
		'south': [
			'sprite:bubble.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
