function Viewport(game, x, y, size)
{
	var canvas		= game.canvas;
	this.game		= game;
	this.canvas     = canvas;
	this.context	= canvas[0].getContext('2d');
	this.x          = x     || 5;
	this.y          = y     || 5;
	this.size       = size  || 16;

	this.updateRadius = 5;

	this.paused		= false;

	this.world;

	this.xOffset    = 0;
	this.yOffset    = 0;

	this.xPosition  = 0;
	this.yPosition  = 0;

	this.lastXPosition = 1;
	this.lastYPosition = 1;

	this.xDraw		= 0;
	this.yDraw		= 0;

	this.lastXDraw	= 1;
	this.lastYDraw	= 1;

	this.forceUpdateFlag = 0;

	this.cacheBG	= null;

	this.actor;

	this.nextMoveInfo = null;

	this.updateObjectsEarly = [];

	this.panes = [];
	this.panesXY = [];
	this.paneSize	= 9;
	this.maxPanes	= 9;

	this.panesToEdgeX = Math.floor((this.x/2)/this.paneSize)+1;
	this.panesToEdgeY = Math.floor((this.y/2)/this.paneSize)+1;

	this.updateEarly = function(object)
	{
		this.updateObjectsEarly.push(object);
	}

	this.bindWorld  = function(world)
	{
		this.world  = world;

		this.world.bindViewport(this);

		this.world.setTileSize(this.size);
	}

	this.forceTileUpdate = function(x,y)
	{
		if(!this.panesXY[Math.floor(x/this.paneSize)])
		{
			return;
		}

		this.panesXY
			[Math.floor(x/this.paneSize)]
			[Math.floor(y/this.paneSize)] = undefined;
	}

	this.forceBgUpdate	= function()
	{
		this.panes = [];
		this.panesXY = [];
		this.forceUpdateFlag = true;
	}

	this.bindCamera				= function(actor)
	{
		if(!actor)
		{
			return;
		}
		
		this.actor				= actor;

		this.warp(
			this.actor.x - (center[0]-1)
			, this.actor.y - (center[1]-1)
		);
	}

	this.unBindCamera			= function(actor)
	{
		if(this.actor === actor)
		{
			this.actor = null;
		}
	}

	this.togglePause = function()
	{
		this.paused = !this.paused;
	}

	this.resize		= function()
	{
		if(this.canvas)
		{
			this.canvas[0].setAttribute('width', this.x * this.size);
			this.canvas[0].setAttribute('height', this.y * this.size);
		}

		this.renderWidth   = (this.x * this.size);
		this.renderHeight  = (this.y * this.size);

		this.renderCenter	= [this.renderWidth/2,this.renderHeight/2];

		this.renderBreadth    = [
			Math.round((this.x) * this.size / 2)
			, Math.round(this.y * this.size / 2)
		];

		if(this.canvas)
		{
			this.canvasOffsetX = $(this.canvas).offset().left;
			this.canvasOffsetY = $(this.canvas).offset().top;
		}
	};

	this.resize();

	this.overlayColor = null;
	this.overlayOpacity = null;

	this.overlay = function(color, opacity)
	{
		this.overlayColor = color;
		this.overlayOpacity = opacity;
	}

	this.removeOverlay = function()
	{
		this.overlayColor = null;
		this.overlayOpacity = null;
	}

	this.fadeOverlayFrames = 0;
	this.fadeOverlayFramesMax = 0;

	this.fadeOverlay= function(frameCount)
	{
		this.fadeOverlayFrames = frameCount;
		this.fadeOverlayFramesMax = frameCount;
	}

	this.context	= canvas[0].getContext('2d');
	var context		= this.context;

	this.cachePane	= function(pane, x, y)
	{
		if(this.panes.length >= this.maxPanes)
		{
			var deadPane = this.panes.pop();

			if(!this.panesXY[deadPane.x])
			{
				this.panesXY[deadPane.x] = [];
			}

			this.panesXY[deadPane.x][deadPane.y] = null;
		}

		this.panes.unshift(pane);

		if(!this.panesXY[x])
		{
			this.panesXY[x] = [];
		}

		this.panesXY[x][y] = pane;
	}

	this.renderPane	=  function(x, y, forceUpdate)
	{
		var virtualCanvas	= document.createElement('canvas');
		var virtualContext	= virtualCanvas.getContext('2d');

		var pane;
		var xPane = x * this.paneSize;
		var yPane = y * this.paneSize;

		if(!(this.panesXY[x] && this.panesXY[x][y]))
		{
			// console.log('RENDER PANE', x, y);
			virtualCanvas.width = this.paneSize * this.size;
			virtualCanvas.height = this.paneSize * this.size;

			for(var xI = xPane; xI < xPane + this.paneSize; xI++){
			for(var yI = yPane; yI < yPane + this.paneSize; yI++){
				this.world.renderTile(
					virtualContext
					, xI
					, yI
					, (xI-xPane) * this.size
					, (yI-yPane) * this.size
				);
			}}

			pane = new Pane(
				virtualContext.getImageData(
					0 ,0
					, this.paneSize * this.size
					, this.paneSize * this.size
				)
			);

			this.cachePane(pane, x ,y);
		}
		else
		{
			pane = this.panesXY[x][y];
		}

		this.context.putImageData(
			pane.imgData
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
		);

		this.context.fillStyle = '#0FF'
		this.context.strokeStyle = '#0FF'
		this.context.lineWidth = 1;
		this.context.font = '11pt bold arial';
/*
		this.context.fillText(
			"(" + xPane + ", " + yPane + ")"
			+ " : (" + x + ", " + y + ") \n"
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 20
		);
		this.context.fillText(
			" : (" +( (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			)+ ", " +( (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset +")"
			)+ forceUpdate
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 40
		);
		this.context.fillText(
			this.yPosition
			, (xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
				+ 60
		);
 *//*
		this.context.strokeRect(
			(xPane * this.size) - (this.xPosition * this.size)
				+ this.xOffset
			, (yPane * this.size) - (this.yPosition * this.size)
				+ this.yOffset
			, this.paneSize * this.size
			, this.paneSize * this.size
		);
   */
	}

	this.render     = function()
	{
		if(this.paused)
		{
			return;
		}

		context.strokeStyle = 'white';

		context.beginPath();
		context.save();

		context.rect(
			Math.floor(
				this.renderCenter[0]
				- this.renderBreadth[0]
			)
			, Math.floor(
				this.renderCenter[1]
					- this.renderBreadth[1]
			)
			, this.x * this.size
			, this.y * this.size
		);

		context.clip();

		context.fillStyle = '#0FF';
		context.fillRect(
			Math.floor(
				this.renderCenter[0]
				- this.renderBreadth[0]
			)
			, Math.floor(
				this.renderCenter[1]
					- this.renderBreadth[1]
			)
			, this.x * this.size
			, this.y * this.size
		);

		var shiftX = Math.floor((
			this.xPosition + Math.floor(this.renderBreadth[0]/this.size)
		) / this.paneSize);
		var shiftY = Math.floor((
			this.yPosition + Math.floor(this.renderBreadth[1]/this.size)
		) / this.paneSize);

		for(var xI = shiftX - (this.panesToEdgeX);
			xI <= shiftX + (this.panesToEdgeX);
			xI+=1
		){
			for(var yI = shiftY - (this.panesToEdgeY);
				yI <= shiftY + (this.panesToEdgeY);
				yI+=1
			){
				this.renderPane(xI, yI);
			}
		}

		this.lastXDraw = this.xDraw;
		this.lastYDraw = this.yDraw;

		var xStart	= -this.x + this.xPosition;
		var xEnd	= this.x + this.xPosition+2;
		var xInc	= 1;

		var yStart	= -this.y + this.yPosition;
		var yEnd	= this.y + this.yPosition +2;
		var yInc	= 1;

		for(
			var yI = yStart;
			yI != yEnd;
			yI += yInc
		){
			for(
				var xI = xStart;
				xI != xEnd;
				xI += xInc
			){
				if(this.world.isWall(xI, yI)
					&& xI >= -1
					&& yI >= -1
					&& xI <= this.world.worldWidth
					&& yI <= this.world.worldHeight
					&& this.game.dev
				){
					context.strokeStyle = '#f00';

					context.strokeRect(
						xI * this.size
							- (this.xPosition * this.size)
						, yI * this.size
							- (this.yPosition * this.size)
						, this.size
						, this.size
					);
				}
				else if(xI >= -1
					&& yI >= -1
					&& xI <= this.world.worldWidth
					&& yI <= this.world.worldHeight
					&& this.game.dev
				){
					/*
					context.strokeStyle = '#000';

					context.strokeRect(
						xI * this.size
							- (this.xPosition * this.size)
						, yI * this.size
							- (this.yPosition * this.size)
						, this.size
						, this.size
					);
					*/
				}

				for(var oI in this.world.getObjects(xI, yI))
				{
					var obj = this.world.getObjects(xI, yI)[oI];

					if(obj)
					{
						if(this.game.dev)
						{
							context.strokeStyle = '#00f';

							context.strokeRect(
								xI * this.size
									- (this.xPosition * this.size)
								, yI * this.size
									- (this.yPosition * this.size)
								, this.size
								, this.size
							);
						}

						if(this.game.dev && obj instanceof FloorActor)
						{
							context.drawImage(
								imageCache.loadImage(
									obj.sprite.standard()[0]
								)
								, xI * this.size
									- (this.xPosition * this.size)
								, yI * this.size
									- (this.yPosition * this.size)
								, this.size
								, this.size
							);
						}

						obj.render(
							context
							, this.xPosition
							, this.yPosition
							, (xI - this.xPosition) * this.size
								+ this.renderCenter[0]
								- this.renderBreadth[0]
								+ this.xOffset
							, (yI - this.yPosition) * this.size
								+ this.renderCenter[1]
								- this.renderBreadth[1]
								+ this.yOffset
							, this.size
						);
					}
				}
			}
		}

		if(this.overlayColor)
		{
			context.fillStyle = this.overlayColor;

			context.globalAlpha = this.overlayOpacity;

			if(this.fadeOverlayFrames)
			{
				context.globalAlpha = this.overlayOpacity *
					(this.fadeOverlayFrames / this.fadeOverlayFramesMax);

				this.fadeOverlayFrames--;

				if(!this.fadeOverlayFrames)
				{
					this.removeOverlay();
				}
			}

			context.fillRect(
				Math.floor(
					this.renderCenter[0]
					- this.renderBreadth[0]
				)
				, Math.floor(
					this.renderCenter[1]
						- this.renderBreadth[1]
				)
				, this.x * this.size
				, this.y * this.size
			);

			context.globalAlpha = 1;
		}

		if(this.game.dev
		    && this.game.editor
			&& this.game.editor.startSelectedTile
			&& this.game.editor.selectedTile
		){
			context.strokeStyle = '#0ff';

			var xAdd = 0;
			var yAdd = 0;
			var xAddEnd = 1;
			var yAddEnd = 1;

			if(this.game.editor.startSelectedTile[0] > this.game.editor.selectedTile[0])
			{
				xAdd = 1;
				xAddEnd = -1;
			}

			if(this.game.editor.startSelectedTile[1] > this.game.editor.selectedTile[1])
			{
				yAdd = 1;
				yAddEnd = -1;
			}

			context.strokeRect(
				this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
					+ (xAdd * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size)
					+ (yAdd * this.size)
				, this.size *
					(this.game.editor.selectedTile[0] - this.game.editor.startSelectedTile[0] + xAddEnd)
				, this.size *
					(this.game.editor.selectedTile[1] - this.game.editor.startSelectedTile[1] + yAddEnd)
			);

			context.fillStyle = '#033';
			context.strokeStyle = '#0EE';
			context.font = '15pt bold sans';

			context.strokeText(
				(this.game.editor.startSelectedTile[0])
				+ ", "
				+ (this.game.editor.startSelectedTile[1])
				+ ' - '
				+ (this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);

			context.fillText(
				(this.game.editor.startSelectedTile[0])
				+ ", "
				+ (this.game.editor.startSelectedTile[1])
				+ ' - '
				+ (this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.startSelectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.startSelectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);
		}
		else if(this.game.dev && this.game.editor && this.game.editor.selectedTile)
		{
			context.strokeStyle = '#0ff';

			context.strokeRect(
				this.game.editor.selectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.selectedTile[1] * this.size
					- (this.yPosition * this.size)
				, this.size
				, this.size
			);

			context.fillStyle = '#0FF';

			context.fillText(
				(this.game.editor.selectedTile[0])
				+ ", "
				+ (this.game.editor.selectedTile[1])
				, this.game.editor.selectedTile[0] * this.size
					- (this.xPosition * this.size)
				, this.game.editor.selectedTile[1] * this.size
					- (this.yPosition * this.size) - 10
			);
		}

		context.restore();
	}

	var center	= [
		Math.ceil(this.x/2)
		, Math.ceil(this.y/2)
	];

	this.update     = function(input)
	{
		//console.log(this.actor);

		if (input.keyStates[16] == 1)
		{
			this.togglePause();
		}

		if(this.paused)
		{
			return;
		}

		this.mouseTile = [
			Math.floor((window.mouseX - this.canvasOffsetX)/this.size)
			, Math.floor((window.mouseY - this.canvasOffsetY)/this.size)
		];

		if(this.actor && this.actor.getMove)
		{
			this.nextMoveInfo = this.actor.getMove(input);
		}

		var xStart	= this.x + this.xPosition + this.updateRadius;
		var xEnd	= -this.x  + this.xPosition  - this.updateRadius;
		var xInc	= -1;

		var yStart	= -this.y + this.yPosition - this.updateRadius;
		var yEnd	= 1 + this.y + this.yPosition + this.updateRadius;
		var yInc	= 1;
		var earlyList = {};

		for(var eI in this.updateObjectsEarly)
		{
			if(!this.updateObjectsEarly[eI] || this.game.dev)
			{
				continue;
			}

			this.updateObjectsEarly[eI].update(input);

			earlyList[
				this.updateObjectsEarly[eI].x
				+ '' + this.updateObjectsEarly[eI].y
				+ '' + this.updateObjectsEarly[eI].i
			] = true;
		}

		for(
			var xI = xStart;
			xI != xEnd;
			xI += xInc
		){
			for(
				var yI = yStart;
				yI != yEnd;
				yI += yInc
			){
				for(var oI in this.world.getObjects(xI, yI))
				{
					var currentObject = this.world.getObjects(xI, yI)[oI];

					if(currentObject
					   && ! currentObject.heldBy
					   && ! currentObject.master
					   && this.game.dev === false
					){
						currentObject.update(input);
					}
				}
			}
		}

		var processing = true;
		var lastDitch = true;
		var loops = 0;

		while(processing)
		{
			processing = !this.world.processStepMatrix();

			if(!processing && lastDitch)
			{
				processing = true;
				lastDitch = false;
			}

			loops++;
		}

		var notMoved = this.world.stepMatrixContents();

		for(var i in notMoved)
		{
			if(notMoved[i].pusher)
			{
				notMoved[i].crush(notMoved[i].pusher);
			}
		}

		//console.log('StepMatrix Looped ' + loops + ' times.', this.world.stepMatrixContents());

		this.world.refreshStepMatrix();

		if(this.actor)
		{
			this.warp(
				this.actor.x - (center[0]-1)
				, this.actor.y - (center[1]-1)
			);

			this.xOffset = -this.actor.getOffsetX(this.size);
			this.yOffset = -this.actor.getOffsetY(this.size);
		}
	}

	this.warp       = function(x, y)
	{
		this.xPosition = x;
		this.yPosition = y;
	}
}
