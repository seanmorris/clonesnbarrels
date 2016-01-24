var SaveState = Storable.extend({
	init: function()
	{
		this.savedata = null;
		
		this._endpoint = '/clonesNBarrels/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		if(!this.publicId)
		{
			this.publicId = localStorage.getItem(this._key);
		}

		this.savedata = JSON.stringify(world.getState());

		this._super();
	}
	, load: function(world)
	{
		if(!this.publicId)
		{
			this.publicId = localStorage.getItem(this._key);
		}

		this._super();

		this.savedata = JSON.parse(this.savedata);

		world.setState(this.savedata);

		for(var map in this.savedata.state)
		{
			world.mapSet.loadState(map);
		}

		world.mapSet.switchMap(
			this.savedata.playerState.map
			, this.savedata.playerState.x
			, this.savedata.playerState.y
			, true
		);
	}
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
			, true
		);
	}
});