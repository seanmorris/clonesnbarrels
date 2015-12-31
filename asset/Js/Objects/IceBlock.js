var IceBlock = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new IceBlockSprite());
	}
	, reinit: function()
	{
		this.name = 'IceBlock';
		this._super(new IceBlockSprite());
	}
});
