function TriggerSprite()
{
	this.standing = {
		'south': [
			'sprite:trigger.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
