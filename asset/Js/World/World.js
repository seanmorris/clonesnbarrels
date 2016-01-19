var World = Class.extend({
	init: function()
	{
		this.tileSize;
		this.game;
		this.map					= new Map(this);
		this.mapSet					= new MapSet(this);
		this.worldWidth				= this.map.width;
		this.worldHeight			= this.map.height;
		this.objects                = [];
		this.stepMatrix				= [];
		this.addedTiles				= [];
	}

	, bindGameObject: function(game)
	{
		this.game				= game;
	}

	, getTile: function(x, y)
	{
		return new Tile(this, x, y);
	}

	, addObject: function(object, x, y)
	{
		if(!this.objects)
		{
			this.objects        = [];
		}

		if(!this.objects[x])
		{
			this.objects[x]     = [];
		}

		if(!this.objects[x][y])
		{
			this.objects[x][y]  = [];
		}

		this.objects[x][y].push(object);

		if(object)
		{
			object.bindWorld(this);	
			var i = this.objects[x][y].length - 1;
			object.setPosition(x, y, i);
		}

		return i;
	}

	, removeObject: function(x, y, i, leaveIntact)
	{
		var obj;

		if(this.objects[x]
		   && this.objects[x][y]
		   && this.objects[x][y][i]
		){
			obj = this.objects[x][y][i];

			this.objects[x][y].splice(i, 1);

			for(var j in this.objects[x][y])
			{
				this.objects[x][y][j].i = j;
			}
		}

		if(this.objects[x] && this.objects[x][y])
		{
			var reset = true;

			for(var oI in this.objects[x][y])
			{
				if(this.objects[x][y][oI])
				{
					reset = false;
				}
			}

			if(reset)
			{
				this.objects[x][y] = [];
			}
		}

		if(obj)
		{
			//object.world = undefined;
			obj.setPosition(x, y, null);
		}

		return obj;
	}

	, getObjects: function(x, y)
	{
		if(this.objects[x]
		   && this.objects[x][y]
		){
			return this.objects[x][y];
		}

		return false;
	}

	, populateObjects: function()
	{
		//console.log('POPULATE');

		for(var i in this.map.objects)
		{
			//console.log('populate', i);

			var coords = this.map.indexToCoords(i);

			for(var j in this.map.objects[i])
			{
				var obj = new this.map.objectPallet[
					this.map.objects[i][j]
				];

				this.addObject(
					obj
					, coords[0]
					, coords[1]
				);

				if(this.map.objectInits[i] && this.map.objectInits[i][j])
				{
					for(var k in this.map.objectInits[i][j])
					{
						//console.log('POP', k, this.map.objectInits[i][j][k]);

						if(this.map.objectInits[i][j][k] == parseInt(this.map.objectInits[i][j][k]))
						{
							this.map.objectInits[i][j][k] = parseInt(this.map.objectInits[i][j][k]);
						}

						//console.log('SETTING', k);

						obj[k] = this.map.objectInits[i][j][k];
					}

					//console.log('BEFORE SPRITE UPDATE');

					obj.updateSprite();

					//console.log('AFTER SPRITE UPDATE');
				}
			}
		}

		for(var i in this.map.objectTriggers)
		{
			for(var j in this.map.objectTriggers[i])
			{
				var sCoords = this.map.indexToCoords(i);

				var obj = this.getObjects(
					sCoords[0]
					, sCoords[1]
				)[parseInt(j)];

				var triggerRefs = this.map.getTriggers(obj);

				if(triggerRefs)
				{
					for(var k in triggerRefs)
					{
						//console.log(triggerRefs);

						var trigger = this.getObjects(
							triggerRefs[k].x
							, triggerRefs[k].y
						)[triggerRefs[k].i];

						//console.log(trigger);

						if(obj.triggers && trigger)
						{
							obj.triggers.push(trigger);
						}
					}
				}
			}
		}
	}

	, flushObjects: function()
	{
		for(var x in this.objects){
		for(var y in this.objects[x]){
		for(var i in this.objects[x][y]){
			var obj = this.removeObject(x, y, i);
			if(obj)
			{
				obj.destroy(true);
				obj.world = undefined;
			}
		}}}

		this.objects = [];
	}

	, setTileSize: function(size)
	{
		this.tileSize           = size;
	}

	, flushAddedTiles: function()
	{
		this.addedTiles = [];
	}

	, addTile: function(x, y, frames, wall, replace)
	{
		if(!this.addedTiles[x])
		{
			this.addedTiles[x] = [];
		}

		if(!this.addedTiles[x][y])
		{
			this.addedTiles[x][y] = [];
		}

		var newIndex;

		if(replace === undefined)
		{
			this.addedTiles[x][y].push({
				frames: frames
				, wall: wall
			});

			newIndex = this.addedTiles[x][y].length -1;
		}
		else
		{
			newIndex = replace;

			this.addedTiles[x][y][replace] = {
				frames: frames
				, wall: wall
			};
		}

		this.viewport.forceTileUpdate(x,y);

		return {
			x: x
			, y: y
			, i: newIndex
		};
	}

	, removeTile: function(x, y, i)
	{
		if(this.addedTiles
			&& this.addedTiles[x]
			&& this.addedTiles[x][y]
			&& this.addedTiles[x][y][i]
		){
			this.addedTiles[x][y][i] = null;
			this.viewport.forceTileUpdate(x,y);
		}
	}

	, isWall: function(x, y)
	{
		return this.map.getWall(x, y);
	}

	, refreshStepMatrix: function()
	{
		this.stepMatrix			= [];
	}

	, requestStep: function(stepper, direction)
	{
		if(!this.stepMatrix[stepper.x])
		{
			this.stepMatrix[stepper.x] = [];
		}

		if(!this.stepMatrix[stepper.x][stepper.y])
		{
			this.stepMatrix[stepper.x][stepper.y] = [];
		}

		this.stepMatrix[stepper.x][stepper.y][stepper.i] = {
			stepper:		stepper
			, direction:	stepper.direction
		}
	}

	, processStepMatrix: function()
	{
		var complete = true;

		for(var xI in this.stepMatrix){
		for(var yI in this.stepMatrix[xI]){
		for(var iI in this.stepMatrix[xI][yI]){
			var stepX   = 0;
			var stepY   = 0;
			var canStep	= true;

			if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.RIGHT)
			{
				stepX				= 1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.DOWN)
			{
				stepY				= 1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.LEFT)
			{
				stepX				= -1;
			}
			else if(this.stepMatrix[xI][yI][iI].direction == this.stepMatrix[xI][yI][iI].stepper.UP)
			{
				stepY				= -1;
			}

			var objects = this.getObjects(
				parseInt(this.stepMatrix[xI][yI][iI].stepper.x)
					+ parseInt(stepX)
				, parseInt(this.stepMatrix[xI][yI][iI].stepper.y)
					+ parseInt(stepY)
			);

			for(var oI in objects)
			{
				if(objects[oI] && objects[oI].i !== null)
				{
					if(objects[oI].push(this.stepMatrix[xI][yI][iI].stepper))
					{
						complete = false;
					}
					else if(!objects[oI].canBeSteppedOn(this.stepMatrix[xI][yI][iI].stepper))
					{
						objects[oI].collide(this.stepMatrix[xI][yI][iI].stepper);
						this.stepMatrix[xI][yI][iI].stepper.collide(objects[oI]);
						canStep = false;
					}
				}
			}

			if(this.isWall(
				parseInt(this.stepMatrix[xI][yI][iI].stepper.x) + stepX
				, parseInt(this.stepMatrix[xI][yI][iI].stepper.y) + stepY)
			){
				canStep = false;
			}

			var obj = this.removeObject(
				this.stepMatrix[xI][yI][iI].stepper.x
				, this.stepMatrix[xI][yI][iI].stepper.y
				, this.stepMatrix[xI][yI][iI].stepper.i
			);

			if(obj)
			{
				obj.justStepped		= false;
				obj.stepping		= true;
				obj.stepTimer		= obj.stepSpeed;
				obj.stepTime		= obj.stepSpeed;
				obj.stepSpeed		= obj.stepSpeed;
			}

			if(obj && !canStep)
			{
				obj.i = this.addObject(
					obj
					, obj.x
					, obj.y
				);
			}
			else if(obj)
			{
				coObjs = this.getObjects(
					parseInt(obj.x) + parseInt(stepX)
					, parseInt(obj.y) + parseInt(stepY)
				);

				obj.i = this.addObject(
					obj
					, parseInt(obj.x) + parseInt(stepX)
					, parseInt(obj.y) + parseInt(stepY)
				);

				for(var j in coObjs)
				{
					if(coObjs[j] && coObjs[j].steppedOn &&  coObjs[j] !== obj)
					{
						coObjs[j].steppedOn(obj);
					}
				}

				obj.onStep();

				if(obj.holding)
				{
					obj.holding.stepSpeed = obj.stepSpeed;
					this.requestStep(obj.holding, obj.direction);
				}
				else if(obj.holding)
				{
					//obj.stopHolding();
				}

				if(obj.direction == obj.RIGHT)
				{
					obj.drawOffsetX	= -1;
				}
				else if(obj.direction == obj.DOWN)
				{
					obj.drawOffsetY	= -1;
				}
				else if(obj.direction == obj.LEFT)
				{
					obj.drawOffsetX	= 1;
				}
				else if(obj.direction == obj.UP)
				{
					obj.drawOffsetY	= 1;
				}

				complete = false;

				delete this.stepMatrix[xI][yI][iI];
			}
		}}}

		return complete;
	}

	, stepMatrixContents: function()
	{
		var objects = [];
		for(var xI in this.stepMatrix){
		for(var yI in this.stepMatrix[xI]){
		for(var iI in this.stepMatrix[xI][yI]){
			if(this.stepMatrix[xI][yI][iI] && this.stepMatrix[xI][yI][iI].stepper)
			{
				objects.push(this.stepMatrix[xI][yI][iI].stepper);
			}
		}}}
		return objects;
	}

	, steppedOn: function(stepper, x, y, testCall)
	{
		if(this.objects[x] && this.objects[x][y])
		{
			for(var i in this.objects[x][y])
			{
				if(this.objects[x][y][i])
				{
					if(!this.objects[x][y][i].steppedOn(stepper, true))
					{
						return false;
					}

					if(stepper.holding === this.objects[x][y][i])
					{
						this.objects[x][y][i].turn(stepper.direction);
						return this.objects[x][y][i].canStep();
					}

					if(this.objects[x][y][i] && !this.objects[x][y][i].steppedOn(stepper, testCall))
					{
						return false;
					}
				}
			}
		}

		return !this.isWall(x, y) && !this.isWallTop(x, y);
	}

	, canSpawn: function(x,y)
	{
		if(this.objects[x] && this.objects[x][y])
		{
			for(var i in this.objects[x][y])
			{
				if(this.objects[x][y][i])
				{
					if(!this.objects[x][y][i].canSpawn())
					{
						return false;
					}
				}
			}
		}

		return !this.isWall(x, y);
	}

	, bindViewport: function(viewport)
	{
		this.viewport			= viewport;
	}

	, renderTile: function(context, x, y, xPos, yPos)
	{
		var text                = '(' + x + ', ' + y + ')';
		var viewport			= this.viewport;

		if(x > this.worldWidth
			|| y > this.worldHeight
			|| this.map.getTile(x, y) === undefined
			|| this.map.resolveTile(this.map.getTile(x, y)) === undefined
		){
			var tile = imageCache.loadImage(
				'/SeanMorris/ClonesNBarrels/Img/free/pit.png'
				, function()
				{
					viewport.forceBgUpdate();
				}
			);

			if(tile.complete)
			{
				context.drawImage(
					tile
					, xPos
					, yPos
					, this.tileSize
					, this.tileSize
				);
			}
		}
		else
		{
			var tile = imageCache.loadImage(
				this.map.resolveTile(
					this.map.getTile(x, y)
				)
				, function()
				{
					viewport.forceBgUpdate();
				}
			);

			if(tile.complete)
			{
				context.drawImage(
					tile
					, xPos
					, yPos
					, this.tileSize
					, this.tileSize
				);
			}
		}

		if(this.addedTiles[x]
			&& this.addedTiles[x][y]
		)
		{
			for(var i in this.addedTiles[x][y])
			{
				if(this.addedTiles[x][y][i]
					&& this.addedTiles[x][y][i].frames[0]
				){
					context.drawImage(
						imageCache.loadImage(
							this.addedTiles[x][y][i].frames[0]
							, function()
							{
								viewport.forceTileUpdate(x, y);
							}
						)
						, xPos
						, yPos
						, this.tileSize
						, this.tileSize
					);
				}
			}
		}
	}
	, getState: function()
	{
		return {
			state: this.mapSet.storeState()
			, playerState: this.mapSet.playerState
		};
	}
	, setState: function(state)
	{
		this.mapSet.mapStates = state.state;
		this.mapSet.playerState = state.playerState;

		for(var map in this.mapSet.maps)
		{
			this.mapSet.loadState(map);
		}
	}
});
