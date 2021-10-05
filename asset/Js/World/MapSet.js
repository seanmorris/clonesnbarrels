var MapSet = Class.extend({
	init: function(world)
	{
		this.world = world;
		this.maps = {
			//basement: Basement001
			// basement: ''
			// , subBasement: '764C62D2C2C711E5B97E40167E9DAEB6'
			// , surface: '291E1412C2C711E5B97E40167E9DAEB6'
			// , 'Testing Ground A': '9E0AB0DCEFDC11E5A47640167E9DAEB6'

			'Testing Ground A': 'testing-ground-a.json' 
			, subBasement:      'sub-basement.json' 
			, basement:         'basement.json' 
			, surface:          'surface.json' 
		};

		this.mapStates = {};
		this.playerState = {map:null,x:0,y:0};

		this.startingMap = 'basement';
		this.currentMap = null;
	}
	, storeState: function()
	{
		if(!this.currentMap)
		{
			return this.mapStates;
		}

		console.log('STORING STATE FOR MAP', this.currentMap);
		var mainActor = this.world.viewport.actor;

		if(!mainActor || !mainActor instanceof Player)
		{
			mainActor = new Player();

			this.world.addObject(mainActor, this.playerState.x, this.playerState.y);

			this.world.viewport.actor = mainActor;
		}

		this.playerState.map = this.currentMap;
		this.playerState.x = mainActor.x;
		this.playerState.y = mainActor.y;

		this.partyState = {};

		if(mainActor.party)
		{
			for(var i in mainActor.party)
			{
				this.partyState[i] = {
					x: mainActor.party[i].x
					, y: mainActor.party[i].y
					, i: mainActor.party[i].i
				};
			}
		}

		if(this.currentMap)
		{
			this.mapStates[this.currentMap] = [];
		}

		for(var xI in this.world.objects){
		for(var yI in this.world.objects[xI]){
		for(var iI in this.world.objects[xI][yI]){

			/*console.log(
				this.world.objects[xI][yI][iI].name
				, this.world.objects[xI][yI][iI].x
				, this.world.objects[xI][yI][iI].y
			);*/

			if(
				this.world.objects[xI][yI][iI] === mainActor
				|| this.world.objects[xI][yI][iI].doNotStore
			){
				continue;
			}

			var object = this.world.objects[xI][yI][iI];
			var objectCopy = {};

			objectCopy.data = {};
			objectCopy.refs = {};
			objectCopy.refs.triggers = [];

			objectCopy.position = {};
			objectCopy.position.x = this.world.objects[xI][yI][iI].x;
			objectCopy.position.y = this.world.objects[xI][yI][iI].y;
			objectCopy.position.i = this.world.objects[xI][yI][iI].i;

			for(var prop in object)
			{
				if(!(object[prop] instanceof Function)
					&& !(object[prop] instanceof Class)
					&& !(object[prop] instanceof Audio)
					&& !(object[prop] instanceof Image)
					&& prop !== 'tileSet'
					&& prop !== 'triggers'
					&& prop !== 'child'
					&& prop !== 'children'
				){
					objectCopy.data[prop] = object[prop];
					//console.log(prop, object[prop], object[prop] instanceof Audio);
					//JSON.stringify(objectCopy);
				}
			}

			for(var c in this.world.map.objectPallet)
			{
				if(
					object instanceof this.world.map.objectPallet[c]
				){
					objectCopy.constructor = c;
				}
			}

			for(var t in object.triggers)
			{
				objectCopy.refs.triggers.push({
					x: object.triggers[t].x
					, y: object.triggers[t].y
					, i: object.triggers[t].i
				});
			}

			if(!this.mapStates[this.currentMap])
			{
				this.mapStates[this.currentMap] = [];
			}

			this.mapStates[this.currentMap].push(objectCopy);
		}}}

		return this.mapStates;
	}
	, loadState: function(map)
	{
		var addedObjects = [];

		if(this.mapStates[map])
		{
			// console.log(this.mapStates[map].publicId);

			var loc = window.location.pathname.split('/');

			console.log(loc);

			if(this.mapStates[map].publicId && loc.length > 2)
			{
				window.history.replaceState({} ,null, '/map/' + this.mapStates[map].publicId);
			}
			else
			{
				window.history.replaceState({} ,null, '/');
			}

			this.world.flushObjects();
			for(var object in this.mapStates[map])
			{
				var newObject = new this.world.map.objectPallet[
					this.mapStates[map][object].constructor
				];

				// console.log(this.mapStates[map][object]);

				if(newObject)
				{
					newObject.loadedData = this.mapStates[map][object];

					addedObjects.push(newObject);

					for(var p in newObject.loadedData.data)
					{
						// console.log(p, newObject[p], newObject.loadedData.data[p]);
						newObject[p] = newObject.loadedData.data[p];
					}

					/*
					console.log(
						newObject.name
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);
					*/

					newObject.reinit();

					this.world.addObject(
						newObject
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);

					newObject.loadedData = this.mapStates[map][object];
				}
			}

			for(var o in addedObjects)
			{
				if(addedObjects[o])
				{
					if(addedObjects[o] instanceof Projectile
						|| addedObjects[o] instanceof Angle
					){
						console.log(addedObjects[o]);
					}

					if(addedObjects[o].loadedData.refs.triggers[0])
					{
						// console.log(addedObjects[o].loadedData.refs.triggers[0]);
					}

					for(var t in addedObjects[o].loadedData.refs.triggers)
					{
						var trigger = this.world.getObjects(
							addedObjects[o].loadedData.refs.triggers[t].x
							, addedObjects[o].loadedData.refs.triggers[t].y
						)[addedObjects[o].loadedData.refs.triggers[t].i];

						//if(addedObjects[o].triggers && trigger)
						if(trigger)
						{
							addedObjects[o].triggers.push(trigger);
						}
					}
				}
			}
		}
	}
	, switchMap: function(map, x, y, ignoreState, quiet)
	{
		var mainActor = this.world.viewport.actor;

		if(!ignoreState)
		{
			this.storeState();
		}

		var mapData;

		if(typeof this.maps[map] !== 'undefined')
		{
			mapData = this.maps[map];
		}
		else
		{
			mapData = map;
		}

		console.log('Switching to map', mapData);

		if(typeof mapData !== 'object')
		{
			var loadMap = new MapStorable();
			loadMap.load(mapData);
			var publicId = mapData;
			mapData = JSON.parse(loadMap.mapdata);
			mapData.publicId = publicId;
			this.world.game.currentState.mapStorable = loadMap;
			this.maps[publicId] = mapData
		}
		else
		{
			this.world.game.currentState.mapStorable = null;
		}

		this.world.map.setData(
			JSON.stringify(mapData)
			//, ignoreState
		);

		console.log('SWITCHING TO MAP ', mapData.publicId);

		var loc = window.location.pathname.split('/');

		console.log(loc);

		if(mapData.publicId && loc.length > 2)
		{
			window.history.replaceState({} ,null, '/map/' + mapData.publicId);
		}
		else
		{
			window.history.replaceState({} ,null, '/');
		}

		if(ignoreState)
		{
			this.world.flushObjects();
		}

		if(mainActor)
		{
			this.world.removeObject(
				mainActor.x
				, mainActor.y
				, mainActor.i
			);
		}

		this.world.flushAddedTiles();

		this.loadState(map);

		if(x === undefined)
		{
			x = mapData.start[0];
		}

		if(y === undefined)
		{
			y = mapData.start[1];
		}

		this.world.refreshStepMatrix();

		if(!mainActor || mainActor.name !== 'Player')
		{
			mainActor = new Player();
		}

		if(mainActor && y !== undefined)
		{
			this.world.addObject(
				mainActor
				, x
				, y
			);
		}

		if(mainActor)
		{
			this.world.viewport.bindCamera(mainActor);
		}

		if(!quiet)
		{
			this.world.game.message.blit('Map: ' + mapData.title + '.');
		}

		this.currentMap = map;
	}
	, addMap: function(mapStorable)
	{
		this.maps[mapStorable.publicId] = JSON.parse(mapStorable.mapdata);
		this.maps[mapStorable.publicId].publicId = mapStorable.publicId;
	}
});
