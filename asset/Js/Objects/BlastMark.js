var BlastMark = FloorActor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BlastMarkSprite());
	}
	, reinit: function()
	{
		this.name = 'BlastMark';
		this._super(new BlastMarkSprite());
	}
	, steppedOn: function()
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
});
