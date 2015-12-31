function NullSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/null.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
