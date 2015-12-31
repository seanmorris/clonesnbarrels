function PortalSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/portal_blue.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/portal_orange.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
