var Box = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BoxSprite());
		// console.log('NEW BOX');
	}
	, reinit: function()
	{
		this.name = 'Box';
		this._super(new BoxSprite());
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
	, announceDeath: function()
	{
		
	}
});
