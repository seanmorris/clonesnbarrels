function WarpSprite()
{
	this.standing = {
		'south': [
			'sprite:warp.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
