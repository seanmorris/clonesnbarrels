var SaveState = Storable.extend({
	init: function()
	{
		this.savedata = null;
		
		this._endpoint = '/clonesNBarrels/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		this.savedata = JSON.stringify(world.getState());

		this._super();
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

		for(var map in savedata.state)
		{
			world.mapSet.loadState(map);
		}

		world.mapSet.switchMap(
			savedata.playerState.map
			, savedata.playerState.x
			, savedata.playerState.y
			, true
		);
	}
});