function PlayerCorpseSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/player_corpse.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
