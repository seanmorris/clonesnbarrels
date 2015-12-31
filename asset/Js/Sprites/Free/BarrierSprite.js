function BarrierSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrier_bottom_center.png'
		]
		, 'west': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrier_middle_left.png'
		]
		, 'north': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrier_top_center.png'
		]
		, 'east': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrier_middle_right.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
