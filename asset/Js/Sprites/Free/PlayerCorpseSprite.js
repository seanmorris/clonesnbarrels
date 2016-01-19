function PlayerCorpseSprite()
{
	this.standing = {
		'south': [
			'sprite:player_corpse.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
