var CloningNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/cloning.wav');
var CloneMachine = Actor.extend({
	init: function()
	{
		this.coolDownTime	= 15;
		this.coolDown		= 0;
		this.cloneCount		= 0;
		this.fire           = 0;
		this.maxClones		= 3;
		this.col			= 0;
		this.frameTime		= 1;
		this.spacesBack		= 0;
		this.reinit();
		this._super(new ComputerSprite());
	}
	, reinit: function()
	{
		this.name = 'CloneMachine';
		this._super(new ComputerSprite());
		this.cloningNoise	= CloningNoise;
		this.tileSet		= false;
	}
	, update: function()
	{
		if(this.coolDown == 1)
		{
			if(this.cloneCount >= this.maxClones)
			{
				/*this.world.game.stackState(
					'dialog',
					{text: 'Machine resources exhausted.'},
					true
				);*/

				//console.log('boom!');
				//this.destroy();
				return;
			}

			/*
			this.world.game.stackState(
				'dialogMenu', {
					text: "Clone dispensed."
					, menu: new ContinueMenu(this.world.game)
				}, true
			);
			*/

			this.world.game.message.blit('Clone dispensed.', 150, this.cloneCount ? 'good' : 'better');

			var spawnShift = 0;

			while(!this.world.canSpawn(
				this.x-1+(this.cloneCount+spawnShift)%3
				, this.y+1+Math.floor((this.cloneCount+spawnShift)/3)+1
			)){
				spawnShift++;
			}

			var clone = new PlayerClone(new PlayerSprite());

			this.world.addObject(
				clone
				, this.x-1+(this.cloneCount+spawnShift)%3
				, this.y+1+Math.floor((this.cloneCount+spawnShift)/3)+1
			);

			if(this.user && this.user.addParty && !this.user.master)
			{
				this.user.addParty(clone);
			}
			else
			{
				var rootUser = this.user;

				while(rootUser && rootUser.master)
				{
					rootUser = rootUser.master;
				}

				rootUser.addParty(clone);
			}

			this.cloneCount++;
		}

		if(this.coolDown > 0)
		{
			this.frames = this.sprite.warm.south;
			this.coolDown--;
		}
		else
		{
			this.frames = this.sprite.standing.south;
		}

		if(this.tileSet === false)
		{
			this.tileSet = this.world.addTile(
				this.x
				, this.y+1
				, this.sprite.standing.south_bottom
				, false
			);
		}

		this._super();
	}

	, useFacing: function(user)
	{
		if(this.coolDown == 0)
		{
			if(this.cloneCount >= this.maxClones)
			{
				this.world.game.message.blit('Clone Machine resources exhausted.');
				return;
			}

			this.cloningNoise.play();
			this.coolDown = this.coolDownTime;
			this.user = user;
		}
	}
	, destroy: function()
	{
		if(this.tileSet !== false)
		{
			this.world.removeTile(
				this.x
				, this.y+1
				, this.tileSet
			);
		}
		this._super();
	}
});
