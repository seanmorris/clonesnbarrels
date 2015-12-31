var WoodBox = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new WoodBoxSprite(), 200);
	}
	, reinit: function()
	{
		this.name = 'WoodBox';
		this.sprite = new WoodBoxSprite();
	}
	, useFacing: function(user)
	{
		if(user.invincible)
		{
			return this._super(user);
		}
	}
	, push: function(pusher)
	{
		if(pusher.invincible)
		{
			return this._super(pusher);
		}

		this.collide(pusher);
		pusher.collide(this);

		return false;
	}
	, canBePushed: function(pusher)
	{
		if(pusher.invincible)
		{
			return this._super(pusher);
		}

		return false;
	}
	, damage: function(){}
	, explosionDamage: function(amount)
	{
		this._damage(amount);
	}
	, fireDamage: function(amount)
	{
		if(this.cheesed)
		{
			this._damage(Math.ceil(amount/100));
		}
	}
});
