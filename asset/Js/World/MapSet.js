var MapSet = Class.extend({
	init: function(world)
	{
		this.world = world;
		this.maps = {
			basement: Basement001
			, subBasement: Basement002
			, surface: Surface001
		};

		this.mapStates = {};
		this.playerState = {map:null,x:0,y:0};

		this.startingMap = 'basement';
		this.currentMap = null;
	}
	, storeState: function()
	{
		console.log('STORING STATE');
		var mainActor = this.world.viewport.actor;

		if(!mainActor)
		{
			mainActor = new Player();

			this.world.addObject(mainActor, this.playerState.x, this.playerState.y);

			this.world.viewport.actor = mainActor;
		}

		this.playerState.map = this.currentMap;
		this.playerState.x = mainActor.x;
		this.playerState.y = mainActor.y;

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

			this.mapStates[this.currentMap].push(objectCopy);
		}}}

		return this.mapStates;
	}
	, loadState: function(map)
	{
		var addedObjects = [];

		console.log(1234, map, 5678, this.mapStates[map]);

		if(this.mapStates[map])
		{
			this.world.flushObjects();
			for(var object in this.mapStates[map])
			{
				var newObject = new this.world.map.objectPallet[
					this.mapStates[map][object].constructor
				];

				console.log(this.mapStates[map][object]);

				if(newObject)
				{
					newObject.loadedData = this.mapStates[map][object];

					addedObjects.push(newObject);

					for(var p in newObject.loadedData.data)
					{
						console.log(p, newObject[p], newObject.loadedData.data[p]);
						newObject[p] = newObject.loadedData.data[p];
					}

					console.log(
						newObject.name
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);

					newObject.reinit();

					this.world.addObject(
						newObject
						, this.mapStates[map][object].position.x
						, this.mapStates[map][object].position.y
					);
				}
			}

			for(var o in addedObjects)
			{
				if(addedObjects[o])
				{
					if(addedObjects[o] instanceof Projectile
						|| addedObjects[o] instanceof Angle
					){
						//console.log(addedObjects[o]);
					}

					for(var t in addedObjects[o].loadedData.refs.triggers)
					{
						var trigger = this.world.getObjects(
							addedObjects[o].loadedData.refs.triggers[t].x
							, addedObjects[o].loadedData.refs.triggers[t].y
						)[addedObjects[o].loadedData.refs.triggers[t].i];

						console.log(
							this.world.getObjects(
								addedObjects[o].loadedData.refs.triggers[t].x
								, addedObjects[o].loadedData.refs.triggers[t].y
							),
							addedObjects[o].loadedData.refs.triggers[t]
						);

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
	, switchMap: function(map, x, y, ignoreState)
	{
		var mainActor = this.world.viewport.actor;

		console.log(this.mapStates);

		if(!ignoreState)
		{
			this.storeState();
		}

		this.world.map.setData(
			JSON.stringify(this.maps[map])
		);

		console.log(this.mapStates);

		if(ignoreState)
		{
			this.world.flushObjects();
		}

		console.log(this.mapStates);

		if(mainActor)
		{
			this.world.removeObject(
				mainActor.x
				, mainActor.y
				, mainActor.i
			);
		}

		console.log(this.mapStates);

		this.world.flushAddedTiles();

		console.log(this.mapStates);

		this.loadState(map);

		console.log(this.mapStates);

		if(x === undefined)
		{
			x = this.maps[map].start[0];
		}

		if(y === undefined)
		{
			y = this.maps[map].start[1];
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

		this.currentMap = map;
	}
});
