function LavaSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_center_middle.png'
		]
		, 'top': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_top_middle.png'
		]
		, 'bottom': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_bottom_middle.png'
		]
		, 'left': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_center_left.png'
		]
		, 'right': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_center_right.png'
		]
		, 'topLeft': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_top_left.png'
		]
		, 'bottomLeft': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_bottom_left.png'
		]
		, 'topRight': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_top_right.png'
		]
		, 'bottomRight': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_bottom_right.png'
		]
	};

	this.cold = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_center_middle.png'
		]
		, 'top': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_top_middle.png'
		]
		, 'bottom': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_bottom_middle.png'
		]
		, 'left': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_center_left.png'
		]
		, 'right': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_center_right.png'
		]
		, 'topLeft': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_top_left.png'
		]
		, 'bottomLeft': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_bottom_left.png'
		]
		, 'topRight': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_top_right.png'
		]
		, 'bottomRight': [
			'/SeanMorris/ClonesNBarrels/Img/free/lava_cold_bottom_right.png'
		]
	};

	this.standard = function()
	{
		return this.standing.south;
	}
}
