var Sentinel = Wanderer.extend({
	init: function()
	{
		this._super(new SentinelSprite(), 1500);
		this.reinit();
	}
	, reinit: function()
	{
		this.sprite = new SentinelSprite();
		this.name = 'Sentinel';
		this.stepSpeed = 16;
		this.corpse = new Corpse(
			new SentinelCorpseSprite()
			, 10
			, new Explosion()
		);
	}
});