var AbstractTriggerableAllAtOnce = TriggerableAllAtOnce.extend({
	init: function(direction)
	{
		this.reinit();
		this._super();
	}
	, reinit: function()
	{
		this.name = 'AbstractTriggerableAllAtOnce';
		this._super(new TriggerSprite());
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
