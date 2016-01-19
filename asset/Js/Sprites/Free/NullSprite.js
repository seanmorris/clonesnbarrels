function NullSprite()
{
	this.standing = {
		'south': [
			'sprite:null.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
