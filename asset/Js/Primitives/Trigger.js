var TriggerDef = {
	init: function(sprite)
	{
		this.inverse = false;
		this._super(sprite);
		this.triggered = false;
		this.ignoreTypes = [];
		if(!this.triggers)
		{
			this.triggers = [];
		}
	}
	, reinit: function(sprite)
	{
		this._super(sprite);
		if(this.inverse)
		{
			this.triggered = true;
		}
	}
	, trigger: function()
	{
		this.triggered = true;

		if(this.inverse)
		{
			this.triggered = false;
		}
	}
	, update: function()
	{
		this._super();

		if(this.triggers.length)
		{
			var untriggered = false;

			for(var i in this.triggers)
			{
				if(this.triggers[i].triggered)
				{
					untriggered = true;
				}
			}

			if(untriggered)
			{
				triggered = false;
				this.triggered = !untriggered;

				if(this.inverse)
				{
					triggered = true;
					this.triggered = untriggered;
				}
			}
		}
	}
	, onTrigger: function(stepper)
	{

	}
};

var Trigger = Actor.extend(TriggerDef);
