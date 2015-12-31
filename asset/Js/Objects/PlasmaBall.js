var PlasmaBall = Projectile.extend({
	init: function()
	{
		this._super(new FireSprite(), 100, 2, 4);
		this.reinit();
	}
	, reinit: function()
	{
		this.sprite = new FireSprite();
		this.name = 'PlasmaBall';
	}
});
