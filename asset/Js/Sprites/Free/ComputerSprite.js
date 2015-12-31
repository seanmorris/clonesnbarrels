function ComputerSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/computer_top.png'
		]
		, 'south_bottom': [
			'/SeanMorris/ClonesNBarrels/Img/free/computer_bottom.png'
		]
	};

	this.warm = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/computer_top.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/computer_top_warm.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/computer_top_warm.png'
		]
		, 'south_bottom': [
			'/SeanMorris/ClonesNBarrels/Img/free/computer_bottom.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
