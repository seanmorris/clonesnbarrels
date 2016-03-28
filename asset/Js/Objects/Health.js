var Health = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new HealthSprite());
	}
	, reinit: function()
	{
		this.name = 'Health';
		this._super(new RockSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
	, announceDeath: function()
	{
		
	}
});
