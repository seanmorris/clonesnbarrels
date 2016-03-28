var BindableDef = {
	useFacing: function(user)
	{
		if(this.heldBy)
		{
			this.heldBy.stopHolding();
		}

		if(user.wasHeld !== this)
		{
			user.hold(this);
		}
	}
	, push: function(pusher)
	{
		if(!this.heldBy)
		{
			this.direction = pusher.direction;
			this.step(pusher.stepSpeed);
		}

		this.collide(pusher);
		pusher.collide(this);

		this._super(pusher);

		return this.canBePushed(pusher);
	}
	, canBePushed: function(pusher)
	{
		if(this.heldBy && pusher !== this.heldBy)
		{
			return false;
		}

		var stepX   = 0;
		var stepY   = 0;

		if(pusher.direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(pusher.direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(pusher.direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(pusher.direction == this.UP)
		{
			stepY				= -1;
		}

		if(this.world.isWall(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY)
		){
			return false;
		}

		var objects = this.world.getObjects(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY
		);

		for(var i in objects)
		{
			if(objects[i]
				&& !objects[i].push(this)
				&& !objects[i].canBeSteppedOn(this)
			){
				return false;
			}
		}

		return true;
	}
	, update: function()
	{
		this._super();

		if(this.droppedAgo)
		{
			++this.droppedAgo;
		}
	}
	, crush: function(other)
	{
		console.log('CRUSHED!!!', this, other);
	}
};

var Bindable = Actor.extend(BindableDef);
