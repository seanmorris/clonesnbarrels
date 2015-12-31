var Lava = FloorActor.extend({
	init: function()
	{
		this.reinit();
		this.position = 0;
		this.cold = 0;
		this.damage = 200;
		this._super(new LavaSprite());
	}
	, reinit: function()
	{
		this.name = 'Lava';
		this._super(new LavaSprite());
	}
	, steppedOn: function(stepper)
	{
		if(this.cold)
		{
			return;
		}

		if(stepper.fireDamage instanceof Function)
		{
			stepper.fireDamage(this.damage);
		}
		else if(stepper.damage instanceof Function)
		{
			stepper.damage(this.damage);
		}

		if(stepper instanceof IceBlock)
		{
			this.cold = 1;
			this.updateSprite();
		}
	}
	, updateSprite: function()
	{
		var selectedSprite = this.sprite.standing;

		if(this.cold)
		{
			selectedSprite = this.sprite.cold;
		}

		if(this.position == 1)
		{
			this.frames = selectedSprite.topLeft;
		}
		else if(this.position == 2)
		{
			this.frames = selectedSprite.top;
		}
		else if(this.position == 3)
		{
			this.frames = selectedSprite.topRight;
		}
		else if(this.position == 4)
		{
			this.frames = selectedSprite.left;
		}
		else if(this.position == 5)
		{
			this.frames = selectedSprite.right;
		}
		else if(this.position == 6)
		{
			this.frames = selectedSprite.bottomLeft;
		}
		else if(this.position == 7)
		{
			this.frames = selectedSprite.bottom;
		}
		else if(this.position == 8)
		{
			this.frames = selectedSprite.bottomRight;
		}
		else
		{
			this.frames = selectedSprite.south;
		}

		console.log(this.frames);
	}
});
