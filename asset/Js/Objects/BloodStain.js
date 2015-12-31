var BloodStain = FloorActor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BloodStainSprite());
	}
	, reinit: function()
	{
		this.name = 'BloodStain';
		this._super(new BloodStainSprite());
	}
});
