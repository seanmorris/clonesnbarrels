function PitSprite()
{
	this.standing = {
		'south': [
			'sprite:pit.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
