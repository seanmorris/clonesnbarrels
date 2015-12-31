var Character = Actor.extend({
	update: function()
	{
		this.updateSprite();
		this._super();
	}
	, updateSprite: function()
	{
		var direction = this.direction;
		var requestedStep = this.requestedStep;

		if(this.holding && this.holdDirection !== null)
		{
			direction = this.holdDirection;
		}

		if(direction > 3)
		{
			direction = direction % 4;
		}

		if(direction == 0)
		{
			this.frames = this.sprite.standing.east;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.east;
			}
		}
		else if(direction == 1)
		{
			this.frames = this.sprite.standing.south;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.south;
			}
		}
		else if(direction == 2)
		{
			this.frames = this.sprite.standing.west;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.west;
			}
		}
		else if(direction == 3)
		{
			this.frames = this.sprite.standing.north;

			if(this.stepping || requestedStep)
			{
				this.frames = this.sprite.walking.north;
			}
		}
	}
});
