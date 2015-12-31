function BarrelHoleSprite()
{
	this.standing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrel_hole.png'
		]
	};

	this.open = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_open.png'
		]
	};

	this.opening = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening_2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening_3.png'
		]
	};

	this.closing = {
		'south': [
			 '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening_4.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening_3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening_2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_opening.png'
		]
	};

	this.sealing = {
		'south': [
			'/SeanMorris/ClonesNBarrels/Img/free/barrel_hole.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_2.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_3.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing.png'
			, '/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_2.png'
		]
	}

	this.sealed = {
		south: [
			'/SeanMorris/ClonesNBarrels/Img/free/barrel_hole_sealing_2.png'
		]
	}

	this.standard = function()
	{
		return this.standing.south;
	}
}
