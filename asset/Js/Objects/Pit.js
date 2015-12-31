var Pit = StepTrigger.extend({
	init: function()
	{
		this.reinit();
		this._super(new PitSprite());
	}
	, reinit: function()
	{
		this.name = 'Pit';
		this._super(new PitSprite());
	}
	, onTrigger: function(stepper)
	{
		if(stepper.destroy)
		{
			stepper.destroy(true);
		}
	}
});
