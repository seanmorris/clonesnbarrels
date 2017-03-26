var Map = Class.extend({
	init: function(world)
	{
		this.title = 'StandardMap';
		this.world = world;
		this.width	= 7;
		this.height	= 7;
		this.start = [2,2];

		this.tilePallet = [
			'sprite:pit.png'
			, 'sprite:floorTile.png'
			, 'sprite:box_face.png'
			, 'sprite:boxes_top.png'
			, 'sprite:pluto_ground.png'
			, 'sprite:pluto_ground_cracked.png'
			, 'sprite:pluto_crater.png'
			, 'sprite:pluto_crater_top_left.png'
			, 'sprite:pluto_crater_top_center.png'
			, 'sprite:pluto_crater_top_right.png'
			, 'sprite:pluto_crater_middle_left.png'
			, 'sprite:pluto_crater_middle_center.png'
			, 'sprite:pluto_crater_middle_right.png'
			, 'sprite:pluto_crater_bottom_left.png'
			, 'sprite:pluto_crater_bottom_center.png'
			, 'sprite:pluto_crater_bottom_right.png'
			, 'sprite:stairs_top_left.png'
			, 'sprite:stairs_top_right.png'
			, 'sprite:stairs_middle_left.png'
			, 'sprite:stairs_middle_right.png'
			, 'sprite:stairs_bottom_left.png'
			, 'sprite:stairs_bottom_right.png'
			, 'sprite:stairs_down_top_left.png'
			, 'sprite:stairs_down_top_right.png'
			, 'sprite:stairs_down_bottom_left.png'
			, 'sprite:stairs_down_bottom_right.png'
			, 'sprite:rock_1_surface.png'
			, 'sprite:rock_2_surface.png'
			, 'sprite:rock_3_surface.png'
			, 'sprite:rock_4_surface.png'
		];

		this.objectPallet = [
			Angle
			, Barrel
			, BarrelHole
			, BlastMark
			, BloodStain
			, Box
			, Boxes
			, Cheese
			, CloneMachine
			, PlasmaBall
			, WoodBox
			, Sandbag
			, PolyWall
			, Button
			, Pit
			, AbstractTriggerableAny
			, AbstractTriggerableAllAtOnce
			, Barrier
			, LaserBeam
			, Warp
			, Lava
			, Bubble
			, IceBlock
			, Portal
			, Door
			, Rock
			, Health
			, Sentinel
			, Explosion
		];

		this.tileEffectPallet = [
			null
			, 'vacuumDamage'
		];

		this.tiles = [
			2, 2, 2, 2, 2, 2, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 1, 1, 1, 1, 1, 2
			, 2, 2, 2, 2, 2, 2, 2
		];

		this.tiles = [
			4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
			, 4, 4, 4, 4, 4, 4, 4
		];

		this.walls = [
			1, 1, 1, 1, 1, 1, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 0, 0, 0, 0, 0, 1
			, 1, 1, 1, 1, 1, 1, 1
		];

		this.walls = [
			0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
		];

		this.objects = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.objectInits = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.objectTriggers = [
			null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null,
			, null, null, null, null, null, null, null
		];

		this.tileEffects = [
			0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
			, 0, 0, 0, 0, 0, 0, 0
		];
	}
	, getData: function()
	{
		return JSON.stringify({
			title: this.title
			, start: this.start
			, width: this.width
			, height: this.height
			, tiles: this.tiles
			, walls: this.walls
			, objects: this.objects
			, objectInits: this.objectInits
			, objectTriggers: this.objectTriggers
			, tileEffects: this.tileEffects
		});
	}
	, setData: function(string, preventReset)
	{
		var obj = JSON.parse(string);

		this.title	= obj.title;
		this.start	= obj.start;
		this.width	= obj.width;
		this.height	= obj.height;
		this.tiles	= obj.tiles;
		this.walls	= obj.walls;
		this.objects	=	obj.objects;
		this.objectInits	= obj.objectInits;
		this.objectTriggers	= obj.objectTriggers;
		this.tileEffects	= obj.tileEffects;

		this.world.worldWidth = this.width;
		this.world.worldHeight = this.height;
		
		/*
		if(preventReset)
		{
			for(var i in obj.objects)
			{
				if(!obj.objects[i])
				{
					continue;
				}

				for(var j in obj.objects[i])
				{
					if(!obj.objects[i][j])
					{
						continue;
					}

					this.world.addObject(
						obj.objects[i][j]
						, obj.objects[i][j].x
						, obj.objects[i][j].y
					);
				}
			}
			return;
		}
		*/
		
		this.refreshObjects(preventReset);
	}
	, isTileOnMap: function(x, y)
	{
		if(x >= this.width
			|| y >= this.height
			|| x < 0
			|| y< 0
		){
			return false;
		}

		return true;
	}
	, refreshObjects: function(preventReset)
	{
		var mainActor = this.world.viewport.actor;

		this.world.flushObjects();
		this.world.populateObjects();

		//this.world.viewport.forceBgUpdate();

		this.world.addObject(
			mainActor
			, this.start[0]
			, this.start[1]
		);

		this.world.viewport.bindCamera(mainActor);
		this.world.worldWidth = this.width;
		this.world.worldHeight = this.height;

		//this.world.viewport.forceBgUpdate();
	}
	, setWidth: function(width, newTile)
	{
		console.log('W:', newTile);

		if(newTile === null)
		{
			newTile = 0;
		}
		for(var i = 0; i < this.height; i++)
		{
			if(this.width > width)
			{
				this.tiles.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objects.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objectInits.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.objectTriggers.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.walls.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

				this.tileEffects.splice(
					(this.width - (this.width - width)) + (width * i)
					, this.width - width
				);

			}
			else if(this.width < width)
			{
				for(var j = 0; j < width-this.width; j++)
				{
					console.log('w:', newTile);
					this.tiles.splice(
						this.width + (width * i)
						, 0
						, newTile
					);

					this.objects.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.objectInits.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.objectTriggers.splice(
						this.width + (width * i)
						, 0
						, null
					);

					this.walls.splice(
						this.width + (width * i)
						, 0
						, 0
					);

					this.tileEffects.splice(
						this.width + (width * i)
						, 0
						, 0
					);
				}
			}
		}

		this.width = width;
		this.refreshObjects();
	}
	, setHeight: function(height, newTile)
	{
		console.log('H:', newTile);

		if(newTile === null)
		{
			newTile = 0;
		}

		if(this.height < height)
		{
			var newTiles = (height - this.height) * this.width;
			for(var i = 0; i < newTiles; i++)
			{
				this.tiles.push(newTile);
				this.objects.push(null);
				this.objectInits.push(null);
				this.objectTriggers.push(null);
				this.walls.push(0);
				this.tileEffects.push(0);
			}
		}
		else if(this.height > height)
		{
			this.tiles = this.tiles.slice(0, height * this.width);
			this.objects = this.objects.slice(0, height * this.width);
			this.objectInits = this.objectInits.slice(0, height * this.width);
			this.objectTriggers = this.objectInits.slice(0, height * this.width);
			this.walls = this.walls.slice(0, height * this.width);
			this.tileEffects = this.tileEffects.slice(0, height * this.width);
		}

		this.height = height;
		this.refreshObjects();
	}
	, getTile: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.tiles[this.coordsToIndex(x, y)];
		}

		return 0;
	}
	, getTileEffect: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			if(this.tileEffects && this.tileEffects[this.coordsToIndex(x, y)] !== undefined)
			{
				return this.tileEffects[this.coordsToIndex(x, y)];
			}
			
			return 0;
		}

		return 0;
	}
	, setTileEffect: function(effect, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			if(this.tileEffects && this.tileEffects[this.coordsToIndex(x, y)] !== undefined)
			{
				this.tileEffects[this.coordsToIndex(x, y)] = effect;
			}
		}
	}
	, setTile: function(t, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			this.tiles[this.coordsToIndex(x, y)] = t;
		}
	}
	, getWall: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.walls[this.coordsToIndex(x, y)];
		}

		return true;
	}
	, setWall: function(w, x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			this.walls[this.coordsToIndex(x, y)] = !!w;
		}
	}
	, addObject: function(o, x, y, init)
	{
		if(this.objects[this.coordsToIndex(x,y)])
		{
			this.objects[this.coordsToIndex(x,y)].push(o);
			this.objectInits[this.coordsToIndex(x,y)].push(init);
		}
		else
		{
			this.objects[this.coordsToIndex(x,y)] = [o];
			this.objectInits[this.coordsToIndex(x,y)] = [init];
		}
	}
	, getObjects: function(x, y)
	{
		if(this.isTileOnMap(x, y))
		{
			return this.objects[this.coordsToIndex(x,y)];
		}

		return true;
	}
	, getObjectInits: function(x, y)
	{
		console.log('getObjectInits');
		if(this.isTileOnMap(x, y))
		{
			return this.objectInits[this.coordsToIndex(x,y)];
		}

		return true;
	}
	, setObjectInit: function(x, y, i, init)
	{
		if(this.isTileOnMap(x, y))
		{
			this.objectInits[this.coordsToIndex(x,y)][i] = init;
		}
	}
	, appendObjectInit: function(x, y, i, initKey, initVal)
	{
		console.log(x, y, i, initKey, initVal);
		if(this.isTileOnMap(x, y))
		{
			if(!this.objectInits[this.coordsToIndex(x,y)])
			{
				this.objectInits[this.coordsToIndex(x,y)] = [];
			}

			if(!this.objectInits[this.coordsToIndex(x,y)][i])
			{
				this.objectInits[this.coordsToIndex(x,y)][i] = {};
			}

			this.objectInits[this.coordsToIndex(x,y)][i][initKey] = initVal;
		}
	}
	, addTrigger: function(subject, trigger)
	{
		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(!this.objectTriggers[this.coordsToIndex(subject.x,subject.y)])
		{
			this.objectTriggers[objectIndex] = [];
		}

		if(!this.objectTriggers[objectIndex][subject.i])
		{
			this.objectTriggers[objectIndex][subject.i] = [];
		}

		this.objectTriggers[objectIndex][subject.i].push({
			x: trigger.x
			, y: trigger.y
			, i: trigger.i
		});
	}
	, removeTrigger: function(subject, trigger)
	{
		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(this.objectTriggers[objectIndex]
			&& this.objectTriggers[objectIndex][subject.i]
		){
			this.objectTriggers[objectIndex][subject.i].splice(trigger.i);
		}
	}
	, getTriggers: function(subject)
	{
		if(!subject)
		{
			return undefined;
		}

		var objectIndex = this.coordsToIndex(subject.x,subject.y);

		if(!this.objectTriggers)
		{
			this.objectTriggers = [];
		}

		if(!this.objectTriggers[this.coordsToIndex(subject.x,subject.y)])
		{
			return undefined;
		}

		return this.objectTriggers[objectIndex][subject.i];
	}
	, removeObject: function(x, y, i)
	{
		if(this.objects[this.coordsToIndex(x, y)])
		{
			var obj = this.objects[this.coordsToIndex(x, y)].splice(i, 1);
			var objInit = this.objectInits[this.coordsToIndex(x, y)].splice(i, 1);

			return obj;
		}

		return undefined;
	}
	, resolveTile: function(t)
	{
		return this.tilePallet[t];
	}
	, indexToCoords: function(i)
	{
		return [
			parseInt(i) % this.width
			, Math.floor(parseInt(i)/this.width)
		]
	}
	, coordsToIndex: function(x, y)
	{
		return (parseInt(y)*this.width)+parseInt(x);
	}
});
