var Portal = FloorBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new PortalSprite());		
	}
	, reinit: function()
	{
		this.name = 'Portal';
		this.orange = false;
		this.suppress = false;
		this.sticky = false;
		this.recieved = null;
		this._super(new PortalSprite());
	}
	, canBeSteppedOn: function(stepper)
	{
		if(stepper instanceof FloorActor)
		{
			return false;
		}
		
		return true;
	}
	, canBePushed: function(pusher)
	{
		/*
		blockers = this.whyCantStep();

		if(pusher instanceof FloorActor)
		{
			if(this.heldBy)
			{
				this.heldBy.stopHolding();
			}

			if(pusher.heldBy)
			{
				pusher.heldBy.stopHolding();
			}

			return false;
		}

		for(var i in blockers)
		{
			if(blockers[i] instanceof FloorActor)
			{
				if(this.heldBy)
				{
					this.heldBy.stopHolding();
				}

				return false;
			}
		}

		if(this.heldBy == pusher)
		{
			return this._super(pusher);
		}
		*/

		return false;
	}
	, onTrigger: function(stepper)
	{
		if(stepper instanceof FloorActor)
		{
			return;
		}

		if(this.recieved === stepper)
		{
			return;
		}

		if(stepper.stepping)
		{
			return;
		}

		var blockers;

		block:
		for(var i in this.triggers)
		{
			blockers = this.world.getObjects(
				this.triggers[i].x
				, this.triggers[i].y
			);

			for(var j in blockers)
			{
				if(blockers[j].canBePushed(stepper))
				{
					blockers[j].push(stepper);
					break;
				}

				if(!blockers[j].canBeSteppedOn())
				{
					continue block;
				}
			}

			if(stepper.dontPortal)
			{
				return;
			}

			this.triggers[i].recieved = stepper;

			if(stepper.holding)
			//if(stepper.holding == this.triggers[i])
			{
				stepper.stopHolding();
			}

			if(this.triggers[i].heldBy)
			{
				this.triggers[i].heldBy.stopHolding();
			}

			stepper.jump(
				this.triggers[i].x
				, this.triggers[i].y
			);

			this.world.viewport.overlay('#000', 1);
			this.world.viewport.fadeOverlay(4);

			break;
		}

		this.triggered = false;
	}
	, update: function()
	{
		this._super();

		if(this.orange)
		{
			this.frames = this.sprite.standing.east;
		}

		var steppers = this.world.getObjects(this.x, this.y);

		if(steppers.length <= 1)
		{
			this.recieved = null;
		}
	}
});
