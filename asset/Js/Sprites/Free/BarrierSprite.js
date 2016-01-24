var BarrierSprite = Sprite.extend({
	init: function()
	{
		this.standing = {
			'south': [
				'sprite:barrier_bottom_center.png'
			]
			, 'west': [
				'sprite:barrier_middle_left.png'
			]
			, 'north': [
				'sprite:barrier_top_center.png'
			]
			, 'east': [
				'sprite:barrier_middle_right.png'
			]
		};
	}
});
