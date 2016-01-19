function ButtonActivatedSprite()
{
	this.standing = {
		'south': [
			'sprite:button_activated.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
