var Rock = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new RockSprite());
	}
	, reinit: function()
	{
		this.name = 'Rock';
		this._super(new RockSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return false;
	}
	, canSpawn: function()
	{
		return false;
	}
	, announceDeath: function()
	{
		
	}
});
