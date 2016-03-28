var PlasmaBall = Projectile.extend({
	init: function()
	{
		this._super(new FireSprite(), 250, 2, 6);
		this.reinit();
	}
	, reinit: function()
	{
		this.sprite = new FireSprite();
		this.name = 'PlasmaBall';
	}
});
