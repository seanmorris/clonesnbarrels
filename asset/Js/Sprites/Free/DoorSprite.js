var DoorSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:door_closed.png'
			]
		};

		this.open = {
			'south': [
				'sprite:door_opened.png'
			]
		};
	}
});
