function ComputerSprite()
{
	this.standing = {
		'south': [
			'sprite:computer_top.png'
		]
		, 'south_bottom': [
			'sprite:computer_bottom.png'
		]
	};

	this.warm = {
		'south': [
			'sprite:computer_top.png'
			, 'sprite:computer_top.png'
			, 'sprite:computer_top.png'
			, 'sprite:computer_top_warm.png'
			, 'sprite:computer_top_warm.png'
		]
		, 'south_bottom': [
			'sprite:computer_bottom.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
