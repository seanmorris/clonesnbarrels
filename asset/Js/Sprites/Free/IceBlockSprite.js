function IceBlockSprite()
{
	this.standing = {
		'south': [
			'sprite:ice.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
