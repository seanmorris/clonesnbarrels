function WoodBoxSprite()
{
	this.standing = {
		'south': [
			'sprite:wood_box.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
