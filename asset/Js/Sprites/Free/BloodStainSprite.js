function BloodStainSprite()
{
	this.standing = {
		'south': [
			'sprite:blood_stain.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
