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
			, (PlayerClone.cloneCount+1)%3
			, 3
		);

		var iv = 0.4, iv2 = 0.5;

		scaleColorFunc = this.scaleColors(
			1 + ((Math.random()-iv2)*iv)
			, 1 + ((Math.random()-iv2)*iv)
			, 1 + ((Math.random()-iv2)*iv)
			, 1
		);

		PlayerClone.cloneCount++;

		this.alterSprite(colorFunc);
		this.preloadSprite();
		//this.alterSprite(scaleColorFunc);
		this.preloadSprite();

		this.originalSprite = this.sprite.clone();

		// console.log(this.originalSprite);

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

		if(this.health < 0)
		{
			this.ignoreControl = true;
		}

		this._super(input, true);
	}
	, step: function(speed, masterStep)
	{
		if(!this.ignoreControl)
		{
			return this._super(speed);
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
				stepper.party[i].resumeControl = stepper.party[i].stepSpeed;
			}
		}
		this._super(stepper);
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
	, canBeSteppedOn: function(stepper)
	{
		if(!(stepper instanceof Player))
		{
			return false;
		}
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
			if(this.corpse && !clean)
			{
				this.master.addParty(this.corpse);
			}
			
			this.master.removeParty(this)
		}
		
		this._super(clean);
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy.name)
		{
			this.world.game.message.blit('You killed a clone with a ' + this.lastDamagedBy.name, 350);
		}
	}
	, vacuumDamage: function()
	{
		for(var i in this.inventory)
		{
			if(this.inventory[i].preventVacuumDamage)
			{
				return;
			}
		}

		if(this.vacuumDamageTimer <= 0)
		{
			this.damage(10);
			if(this.health <= 0)
			{
				this.world.game.message.blit('A clone suffocated.', 350);
			}
			
			this.vacuumDamageTimer = this.vacuumDamageTimerMax;
			return;
		}

		this.world

		this.vacuumDamageTimer--;
	}
});
PlayerClone.cloneCount = 0;
