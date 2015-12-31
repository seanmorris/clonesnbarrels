var Triggerable = Trigger.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.reinit();
	}
	, reinit: function(sprite)
	{
		this._super(sprite);
		if(!this.triggers)
		{
			this.triggers = [];
		}
	}
	, update: function()
	{
		this._super();

		var triggered = true;

		for(var i in this.triggers)
		{
			if(!this.triggers[i].triggered)
			{
				triggered = false;
			}
		}

		if(!this.triggers.length)
		{
			triggered = false;
		}

		if(triggered)
		{
			this.trigger();
		}
		else
		{
			this.triggered = false;

			if(this.inverse)
			{
				this.triggered = true;
			}
		}

		this.onTrigger();
	}
	, onTrigger: function()
	{

	}
});

var TriggerableAny = Triggerable.extend({
	init: function(sprite)
	{
		if(!sprite)
		{
			sprite = new TriggerSprite();
		}

		this._super(sprite);

		if(!this.name)
		{
			this.name = 'TriggerableAny';
		}
	}
	, update: function()
	{
		var triggered = false;

		for(var i in this.triggers)
		{
			if(this.triggers[i].triggered)
			{
				triggered = true;
			}
		}

		if(!this.triggers.length)
		{
			triggered = false;
		}

		this.triggered = triggered;

		if(this.inverse)
		{
			this.triggered = !triggered;
		}

		if(triggered)
		{
			this.onTrigger();
		}
	}
});

var TriggerableAllAtOnce = Triggerable.extend({
	init: function(sprite)
	{
		if(!sprite)
		{
			sprite = new TriggerSprite();
		}

		this._super(sprite);

		if(!this.name)
		{
			this.name = 'TriggerableAllAtOnce';
		}
	}
	, update: function()
	{
		this._super();

		if(!this.triggered)
		{
			for(var i in this.triggers)
			{
				this.triggers[i].triggered = false;

				if(this.inverse)
				{
					this.triggers[i].triggered = true;
				}
			}
		}
	}
});
