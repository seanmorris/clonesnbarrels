var AbstractTriggerableAny = TriggerableAny.extend({
	init: function()
	{
		this.reinit();
		this._super();
	}
	, reinit: function()
	{
		this.name = 'AbstractTriggerableAny';
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
