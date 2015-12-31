var PlayerClone = Player.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.name = 'PlayerClone';
		this.resumeControl = -1;
		//this.doNotStore = true;

		colorFunc = this.swapColors(
			(PlayerClone.cloneCount+0)%3
			, (PlayerClone.cloneCount+2)%3
			,(PlayerClone.cloneCount+1)%3
		);

		scaleColorFunc = this.scaleColors(
			1//Math.random()
			, 1//Math.random()
			, 1//Math.random()
		);

		PlayerClone.cloneCount++;

		this.alterSprite(colorFunc);
		this.preloadSprite();
		this.alterSprite(scaleColorFunc);
		this.preloadSprite();

		var corpse = this.corpse;

		while(corpse)
		{
			this.alterSprite.apply(corpse, [colorFunc]);
			corpse.preloadSprite();
			this.alterSprite.apply(corpse, [scaleColorFunc]);
			corpse.preloadSprite();
			corpse = corpse.corpse;
		}

		this.direction = this.SOUTH;
		this.hollow = false;
	}
	, reinit: function()
	{
		var prevSprite = this.sprite;
		this.sprite = new NullSprite();

		for(var i in prevSprite)
		{
			this.sprite = prevSprite[i];
		}
	}
	, update: function(input)
	{
		if(this.resumeControl === 0)
		{
			this.resumeControl = -1;
			this.hollow = false;
			this.ignoreControl = false;
		}
		else if(this.resumeControl > 0)
		{
			this.resumeControl--;
		}

		this._super(input, true);
	}
	, step: function(speed, masterStep)
	{
		if(masterStep && !this.ignoreControl)
		{
			this._super(speed);
		}
	}
	, turn: function(direction)
	{
		if(!this.ignoreControl)
		{
			this._super(direction);
		}
	}
	, crush: function(stepper)
	{
		if(stepper instanceof Player
			&& stepper !== this
			&& !(stepper instanceof PlayerClone)
		){
			this.direction = (stepper.direction+2)%4;
			this.hollow = true;

			for(var i in stepper.party)
			{
				stepper.party[i].ignoreControl = true;
				stepper.party[i].resumeControl = stepper.party[i].stepSpeed+1;
			}
		}
	}
	, steppedOn: function(stepper)
	{
		if(stepper instanceof Player
			&& stepper !== this
			&& !(stepper instanceof PlayerClone)
		){
			this._step(this.stepSpeed);
			this.hollow = false;
			this.ignoreControl = false;
		}
	}
	, canBeSteppedOn: function()
	{
		return this.hollow;
	}
	, canSpawn: function()
	{
		return false;
	}
	, destroy: function(clean)
	{
		if(this.master)
		{
			console.log(this.master.removeParty(this));
		}
		this._super(clean);
	}
});
PlayerClone.cloneCount = 0;
