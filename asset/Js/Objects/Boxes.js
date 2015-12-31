var Boxes = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BoxesSprite());
		console.log('NEW BOXES');
	}
	, reinit: function()
	{
		this.name = 'Boxes';
		this._super(new BoxesSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
	, canSpawn: function()
	{
		return false;
	}
});
