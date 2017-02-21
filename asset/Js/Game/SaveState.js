var SaveState = Storable.extend({
	init: function()
	{
		this.title = null;
		this.savedata = null;
		this._endpoint = '/clonesNBarrels/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		if(world.saveStateId)
		{
			this.publicId = world.saveStateId;
			this.title = world.saveStateTitle;
		}

		this.savedata = JSON.stringify(world.getState());

		if(!this.title)
		{
			this.title = 'Save #' + Date.now();
		}

		var result = this._super();

		world.saveStateId    = this.publicId;
		world.saveStateTitle = this.title;

		return result;
	}
	, load: function(world)
	{
		if(world.saveStateId)
		{
			this._super(world.saveStateId);
		}
		else
		{
			this._super();
		}

		this.savedata = JSON.parse(this.savedata);

		world.setState(this.savedata);

		for(var map in this.savedata.state)
		{
			//world.mapSet.loadState(map);
		}

		world.mapSet.switchMap(
			this.savedata.playerState.map
			, this.savedata.playerState.x
			, this.savedata.playerState.y
		);

		if(this.savedata.partyState)
		{
			for(var i in this.savedata.partyState)
			{
				var clone = new PlayerClone();

				world.addObject(
					clone
					, this.savedata.partyState[i].x
					, this.savedata.partyState[i].y
				);

				world.viewport.actor.addParty(clone);
			}
		}

		world.saveStateId = this.publicId;
		world.saveStateTitle = this.title;
	}
	/*
	, update: function(world, ignore, id)
	{
		this._super(world, ignore, id);

		if(ignore)
		{
			return;
		}

		var savedata = JSON.parse(data.savedata);

		world.mapSet.mapStates = savedata.state;
		world.mapSet.playerState = savedata.playerState;

		world.mapSet.switchMap(
			savedata.playerState.map
			, savedata.playerState.x
			, savedata.playerState.y
		);
	}
	*/
});
