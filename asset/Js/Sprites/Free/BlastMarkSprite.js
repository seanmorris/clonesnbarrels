function BlastMarkSprite()
{
	this.standing = {
		'south': [
			'sprite:blast_mark.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
