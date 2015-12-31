var Bubble = Actor.extend({
	init: function()
	{
		this.reinit();
		this._super(new BubbleSprite());
	}
	, reinit: function()
	{
		this.name = 'Bubble';
		this._super(new BubbleSprite());
	}
	, steppedOn: function(stepper)
	{
		this.acquire(stepper);
	}
	, useFacing: function(user)
	{
		this.acquire(user)
	}
	, acquire: function(user)
	{
		this.tileOffsetX = -1;
		this.tileOffsetY = -15;

		this.world.removeObject(
			this.x
			, this.y
			, this.i
		);

		if(user.master)
		{
			user = user.master;
		}

		user.acquire(this);

		if(user.party)
		{
			for(var i in user.party)
			{
				var partyObj = new this.__proto__.constructor;

				partyObj.tileOffsetX = -1;
				partyObj.tileOffsetY = -15;

				user.party[i].acquire(partyObj);
			}
		}
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Player);
	}
});
