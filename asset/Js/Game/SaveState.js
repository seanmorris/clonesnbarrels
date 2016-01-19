var SaveState = Class.extend({
	init: function()
	{
		this.id = null;
		this.publicId = null;
		this.title = null;
		this.savedata = null;
		this.created = null;
		this.updated = null;

		this._endpoint = '/clonesNBarrels/saveState';
		this._key = 'ClonesNBarrelsSaveStateId';
	}
	, save: function(world)
	{
		var data = {};

		this.publicId = localStorage.getItem(this._key);
		
		if(this.publicId)
		{
			this.load(world, true);
		}

		for(var i in this)
		{
			if(!i.match(/^_/) && !(this[i] instanceof Function))
			{
				data[i] = this[i];
			}
		}

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '/edit';

		if(!this.publicId)
		{
			var endpoint = this._endpoint + '/create?api';
		}

		data.savedata = JSON.stringify(world.getState());

		var _this = this;

		$.ajax({
			url: endpoint
			, method: 'POST'
			, data: data
			, dataType: 'JSON'
			, success: function(data)
			{
				console.log(data);

				localStorage.setItem(_this._key, data.publicId);
			}
		});
	}
	, load: function(world, ignore)
	{
		this.publicId = localStorage.getItem(this._key);

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '?api';

		var _this = this;

		var data = JSON.parse($.ajax({
			url: endpoint
			, dataType: 'json'
			, async: false
		}).responseText);

		for(var i in this)
		{
			if(!i.match(/^_/)
				&& data[i] !== undefined
				&& !(this[i] instanceof Function)
			){
				this[i] = data[i];
			}
		}

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