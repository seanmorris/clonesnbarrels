function PortalSprite()
{
	this.standing = {
		'south': [
			'sprite:portal_blue.png'
		]
		, 'east': [
			'sprite:portal_orange.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
