var Sandbag = Bindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new SandbagSprite());
	}
	, reinit: function()
	{
		this.name = 'Sandbag';
		this._super(new SandbagSprite());
	}
	, canBePushed: function(pusher)
	{
		if(pusher instanceof Projectile)
		{
			return false;
		}

		return this._super(pusher);
	}
	, push: function(pusher)
	{
		if(pusher instanceof Projectile)
		{
			return false;
		}

		return this._super(pusher);
	}
});
