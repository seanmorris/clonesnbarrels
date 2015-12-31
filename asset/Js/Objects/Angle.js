var Angle = Bindable.extend({
	init: function(direction)
	{
		if(direction === undefined)
		{
			direction = 3;
		}

		this.angleDirection = direction;
		
		this._super(new AngleSprite());
		this.reinit();
	}
	, reinit: function()
	{
		this.name = 'Angle';
		this._super(new AngleSprite());
		this.updateSprite();
	}
	, push: function(pusher)
	{
		this.direction = pusher.direction;
		if(pusher instanceof Projectile)
		{
			if(pusher.direction == (this.angleDirection+1)%4)
			{
				//return this._super(pusher);
			}

			if(pusher.direction == (this.angleDirection+4)%4)
			{
				//return this._super(pusher);
			}

			return false;
		}

		return this._super(pusher);
	}
	, canBePushed: function(pusher)
	{
		this.direction = pusher.direction;
		if(pusher instanceof Projectile)
		{
			if(pusher.direction == (this.angleDirection+1)%4)
			{
				//return this._super(pusher);
			}

			if(pusher.direction == (this.angleDirection+4)%4)
			{
				//return this._super(pusher);
			}

			return false;
		}

		return this._super(pusher);
	}
	, canBeSteppedOn: function(stepper)
	{
		if(stepper instanceof Projectile)
		{
			if(stepper.direction == (this.angleDirection+2)%4)
			{
				return true;
			}

			if(stepper.direction == (this.angleDirection+3)%4)
			{
				return true;
			}

			return false;
		}

		return this._super(stepper);
	}
	, update: function()
	{
		this._super();

		var coObj = this.world.getObjects(this.x, this.y);

		for(var i in coObj)
		{
			if(coObj[i] !== this
				&& coObj[i].direction == ((this.angleDirection+2)%4)
			){
				coObj[i].turnNext((coObj[i].direction+3)%4);
			}
			else if(coObj[i] !== this
				&& coObj[i].direction == ((this.angleDirection+3)%4)
			){
				coObj[i].turnNext((coObj[i].direction+1)%4);
			}
		}

		if(coObj[i]
			&& coObj[i] instanceof Projectile
			&& !coObj[i].canStep()
		){
			var blocking = coObj[i].whyCantStep();

			for(var j in blocking)
			{
				if(blocking[j] && blocking[j].collide)
				{
					coObj[i].collide(blocking[j]);
					blocking[j].collide(coObj[i]);
				}
			}

			coObj[i].turnNext((coObj[i].direction+2)%4);
		}

		this.updateSprite();
	}
	, updateSprite: function()
	{
		if(this.angleDirection == 0)
		{
			this.frames = this.sprite.standing.east;
		}
		else if(this.angleDirection == 1)
		{
			this.frames = this.sprite.standing.south;
		}
		else if(this.angleDirection == 2)
		{
			this.frames = this.sprite.standing.west;
		}
		else if(this.angleDirection == 3)
		{
			this.frames = this.sprite.standing.north;
		}
	}
});
