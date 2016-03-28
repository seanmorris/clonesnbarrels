var BeepNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/beep.wav');
var Actor = Class.extend({
	init: function(sprite)
	{
		this.sprite = sprite;
		this.originalSprite = new (Class.extend(sprite));

		this.preloadSprite();

		this.frames = [];
		this.world = null;
		this.renderCount = 0;

		this.x = null;
		this.y = null;
		this.i = null;

		this.tileOffsetX = 0;
		this.tileOffsetY = 0;

		this.direction = 0;
		this.nextDirection = null;

		this.stepTime   = 6;
		this.stepTimer  = 0;
		this.stepSpeed	= this.stepTime;

		this.justStepped = false;

		this.stepping	= false;
		this.requestedStep = false;

		this.frameCache	= {};

		this.drawOffsetX	= 0;
		this.drawOffsetY	= 0;

		this.currentFrame	= 0;

		this.frameTime		= 2;
		this.frameTimer		= 0;

		this.RIGHT	= 0;
		this.DOWN	= 1;
		this.LEFT	= 2;
		this.UP		= 3;

		this.EAST	= this.RIGHT;
		this.SOUTH	= this.DOWN;
		this.WEST	= this.LEFT;
		this.NORTH	= this.UP;

		this.holding	= null;
		this.heldBy		= null;
		this.holdX 		= null;
		this.holdY 		= null;
		this.holdDirection = null;
		this.wasHeld	= null;
		this.wasHeldBy	= null;

		this.updateWith = null;

		this.bumpNoise	= BeepNoise;

		this.pushed		= false;
		this.pusher		= null;
		this.crusher 	= null;

		this.stateVars = [
			'x',
			'y',
			'i',
			'direction', 
			'name'
		];

		this.ghost = false;
	}
	, reinit: function(sprite)
	{
		this.sprite = sprite;
	}
	, hold: function(otherActor)
	{
		this.holding = otherActor;

		this.holdX = this.x - this.holding.x;
		this.holdY = this.y - this.holding.y;
		this.holdDirection = this.direction;

		otherActor.heldBy = this;

		console.log('GRABBING');
	}

	, stopHolding: function()
	{
		if(this.holding)
		{
			console.log('DROPPING');
			this.holding.wasHeldBy = this;
			this.holding.heldBy = null;
			this.holding = null;
			this.holdX = null;
			this.holdY = null;
			this.holdDirection = null;
		}
	}

	, resetSprite: function()
	{
		console.log(this.sprite);
		this.sprite = this.originalSprite.clone();
		console.log(this.sprite);
	}
	, preloadSprite: function()
	{
		for(var animation in this.sprite)
		{
			for(var direction in this.sprite[animation])
			{
				var _this = this;

				for(var frame in this.sprite[animation][direction])
				{
					if(animation != 'standard')
					{
						imageCache.loadImage(
							this.sprite[animation][direction][frame]
						);
					}
				}
			}
		}
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(!this.frames.length)
		{
			this.frames = this.sprite.standard();
		}

		if(this.currentFrame >= this.frames.length)
		{
			this.currentFrame = 0;
		}

		var frameSrc = this.frames[this.currentFrame];

		if(frameSrc)
		{
			var _this = this;
			this.itemImg = imageCache.loadImage(frameSrc);

			var tileOffsetY = this.tileOffsetY;

			if(this.heldBy)
			{
				tileOffsetY += this.heldBy.tileOffsetY;
			}

			if(this.itemImg.complete)
			{
				if(!this.heightRatio)
				{
					this.heightRatio = this.itemImg.height/this.itemImg.width;
				}

				context.drawImage(
					this.itemImg
					, xPos + this.getOffsetX(size)
						+ this.tileOffsetX
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ tileOffsetY
					, size
					, size * this.heightRatio
				);
			}
		}

		if(this.holding && this.holdDirection == this.LEFT)
		{
			this.holdingSprite = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/free/handIconLeft.png');
		}
		else if(this.holding)
		{
			this.holdingSprite = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/free/handIcon.png');
		}
		else
		{
			this.holdingSprite = null;
		}

		if(this.holdingSprite && this.holdingSprite.complete)
		{
			if(this.holdDirection == this.LEFT)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 3
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ 25
				);
			}
			if(this.holdDirection == this.DOWN)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 10
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ size
				);
			}
			else if(this.holdDirection == this.RIGHT)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						+ size
						- 12
					, yPos + this.getOffsetY(size)
						- ((size * this.heightRatio) - size)
						+ 25
				);
			}
			if(this.holdDirection == this.UP)
			{
				context.drawImage(
					this.holdingSprite
					, xPos + this.getOffsetX(size)
						- 5
					, yPos + this.getOffsetY(size)
						- 15
				);
			}
		}

		this.renderCount++;
	}

	, update: function()
	{
		if(!this.itemImg)
		{
			this.itemImg    = new Image();
		}

		if(!this.frames)
		{
			this.frames = [];
		}

		if(!this.frames.length)
		{
			this.frames = this.sprite.standard();
		}

		if(this.frameTimer < this.frameTime)
		{
			this.frameTimer++;
		}
		else
		{
			this.currentFrame++;
			this.frameTimer	= 0;
		}

		if(this.currentFrame >= this.frames.length)
		{
			this.currentFrame = 0;
		}

		if(this.stepTimer > 0)
		{
			this.stepTimer--;
		}

		if(this.stepTimer == 0)
		{
			this.stepping 		= false;
			this.drawOffsetX	= 0;
			this.drawOffsetY	= 0;
		}

		if(this.holding)
		{
			this.holding.update();
			if(this.holding)
			{
				this.holding.direction = this.direction;
				if(this.holding
					&& this.holding.x !== this.x
					&& this.holding.y !== this.y
				){
					this.stopHolding();
				}
			}
		}

		if(this.pushed)
		{
			this.pushed = false;
		}
		else
		{
			this.pusher = null;
		}

		this.requestedStep = false;

		if(this.world && this.i !== null)
		{
			var tileEffect = this.world.map.getTileEffect(
				this.x, this.y
			);

			tileEffect = this.world.map.tileEffectPallet[tileEffect];

			if(tileEffect && this[tileEffect] && typeof(this[tileEffect]) === 'function')
			{	
				this[tileEffect]();
			}
		}
	}

	, getOffsetX: function(size)
	{
		if(this.stepTimer)
		{
			return this.drawOffsetX
				* size
				* (this.stepTimer/this.stepTime);
		}

		return 0;
	}

	, getOffsetY: function(size)
	{
		if(this.stepTimer)
		{
			return this.drawOffsetY
				* size
				* (this.stepTimer/this.stepTime);
		}

		return 0;
	}

	, bindWorld: function(world)
	{
		this.world  = world;
	}

	, setPosition: function(x, y, i)
	{
		this.x = parseInt(x);
		this.y = parseInt(y);
		this.i = parseInt(i);
		
		if(this.i!==this.i)
		{
			this.i = null;
		}
	}
	, steppedOn: function(stepper, testCall)
	{
		if(!testCall)
		{
			if(this.heldBy !== stepper)
			{
				this.collide(stepper)
			}
		}
		return false;
	}
	, turn: function(direction)
	{
		this._turn(direction);
	}
	, _turn: function(direction)
	{
		if(!this.stepping)
		{
			this.direction = direction % 4;
		}
	}
	, turnNext: function(direction)
	{
		this.nextDirection = direction;
	}
	, canSpawn: function()
	{
		return this.canBeSteppedOn();
	}
	, canStep: function(testCall)
	{
		if(this.ghost)
		{
			return true;
		}

		var stepX   = 0;
		var stepY   = 0;
		var direction = this.direction;

		if(this.nextDirection !== null)
		{
			var direction = this.nextDirection;
		}

		if(direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(direction == this.UP)
		{
			stepY				= -1;
		}

		if(this.world.isWall(
			parseInt(this.x)+stepX
			,parseInt(this.y) + stepY
		)){
			return false;
		}

		var objects = this.world.getObjects(
			parseInt(this.x) + stepX
			, parseInt(this.y) + stepY
		);

		for(var i in objects)
		{
			if(objects[i]
				&& !objects[i].canBeSteppedOn(this)
				&& !objects[i].canBePushed(this)
			){
				return false;
			}
		}

		return true;
	}
	, whyCantStep: function()
	{
		var stepX   = 0;
		var stepY   = 0;
		var direction = this.direction;

		if(this.nextDirection !== null)
		{
			var direction = this.nextDirection;
		}

		if(direction == this.RIGHT)
		{
			stepX				= 1;
		}
		else if(direction == this.DOWN)
		{
			stepY				= 1;
		}
		else if(direction == this.LEFT)
		{
			stepX				= -1;
		}
		else if(direction == this.UP)
		{
			stepY				= -1;
		}

		return (
			this.world.getObjects(
				parseInt(this.x) + stepX
				, parseInt(this.y) + stepY
			)
		);
	}
	, push: function(pusher)
	{
		this.pusher = pusher;
		this.pushed = true;
		return false;
	}
	, canBePushed: function()
	{
		return false;
	}
	, canBeSteppedOn: function()
	{
		return false;
	}
	, step: function(speed)
	{
		this._step(speed);
	}
	, _step: function(speed)
	{
		if(this.nextDirection !== null)
		{
			this.turn(this.nextDirection);
		}
		this.nextDirection = null;
		this.stepSpeed = speed;
		this.stepTime = speed;
		this.stepTimer = speed;
		this.stepping = true;
		if(this.holding)
		{
			this.holding.direction = this.direction;
		}
		this.requestedStep = true;
		this.world.requestStep(this, this.direction);
	}
	, destroy: function(peaceful)
	{
		if(this.i !== null)
		{
			if(this.heldBy)
			{
				this.heldBy.stopHolding();
			}

			if(this.holding)
			{
				this.stopHolding();
			}

			this.world.viewport.unBindCamera(this);

			//console.log("REMOVING", this, this.world.getObjects(this.x, this.y)[this.i]);

			this.world.removeObject(this.x, this.y, this.i);

			this.i = null;

			this.announceDeath(peaceful);
		}
	}
	, ghostColors: function()
	{
		return function(r,g,b,a,x,y)
		{
			var average = ((r+b+g)/3);
			var alpha = average > 150 ? average : 0;
			return [
				(r+average*2)/3
				, (g+average*2)/3
				, (b+average*2)/3
				, a ? alpha : 0
			];
		}
	}
	, scanGlitchColors: function(scanWidth)
	{
		return function(r,g,b,a,x,y)
		{
			var offset = Math.floor(Date.now()/1000);
			if((y+offset)%scanWidth && (r > 60 || g > 70))
			{
				return [r,g,b,a];
			}
			else
			{
				return [g,r,b,a-((r+b+g)/3)];
			}
		};
	}
	, invertColors: function()
	{
		return function(r,g,b,a)
		{
			return [
				255 - r
				, 255 - g
				, 255 - b
				, a
			];
		}
	}
	, scaleColors: function(iR,iG,iB,iA)
	{
		return function(r,g,b,a)
		{
			r *= iR;
			g *= iG;
			b *= iB;
			a *= iA;

			//return [r,g,b];
			return[
				(r>=0)?(r<256?r:255):0
				, (g>=0)?(g<256?g:255):0
				, (b>=0)?(b<256?b:255):0
				, (a>=0)?(a<256?a:255):0
			];
		}
	}
	, swapColors: function(rP,gP,bP,aP)
	{
		console.log('SWAP:', rP, gP, bP, aP);
		return function()
		{
			return [
				arguments[rP]
				, arguments[gP]
				, arguments[bP]
				, arguments[aP]
			];
		}
	}
	, alterSprite: function(pixelFunc)
	{
		var virtualCanvas	= document.createElement('canvas');
		var virtualContext	= virtualCanvas.getContext('2d');

		this.preloadSprite();

		var sprite = this.sprite;

		for(var animation in this.sprite)
		{
			for(var direction in this.sprite[animation])
			{
				for(var frame in this.sprite[animation][direction])
				{
					if(animation !== 'standard')
					{
						imageCache.loadImage(
							this.sprite[animation][direction][frame]
							, function()
							{
								virtualCanvas.width = this.width;
								virtualCanvas.height = this.height;
								virtualContext.drawImage(this, 0, 0);

								var imageData	= virtualContext.getImageData(
									0, 0
									, this.width
									, this.height
								);

								for(var i = 0; i < imageData.data.length; i += 4)
								{
									var pix = i/4;
									var newPixel = pixelFunc(
										imageData.data[i]
										, imageData.data[i+1]
										, imageData.data[i+2]
										, imageData.data[i+3]
										, (pix % this.width)
										, Math.floor(pix / this.width)
									);

									imageData.data[i] = newPixel[0];
									imageData.data[i+1] = newPixel[1];
									imageData.data[i+2] = newPixel[2];
									imageData.data[i+3] = newPixel[3];


									/*
									imageData.data[i] = 255 - imageData.data[i];
									imageData.data[i + 1] = 255 - imageData.data[i + 1];
									imageData.data[i + 2] = 255 - imageData.data[i + 2];*/
								}

								virtualContext.putImageData(imageData, 0, 0);

								console.log(animation, direction, frame);

								sprite[animation][direction][frame] = virtualCanvas.toDataURL();
							}
							, true
						);
					}
				}
			}
		}

		return this.sprite;
	}
	, collide: function(other)
	{
		//console.log('COLLIDE', this, other);
	}
	, onStep: function()
	{
	}
	, updateSprite: function()
	{
	}
	, getState: function()
	{
		var state = {};
		var stateVars = this.stateVars;

		for(var i in stateVars)
		{
			state[stateVars[i]] = this[stateVars[i]];
		}

		console.log(state);

		return state;
	}
	, jump: function(x, y, relative)
	{
		if(relative)
		{
			x += this.x;
			y += this.y;
		}

		var jumper = this.world.removeObject(
			this.x
			, this.y
			, this.i
			, true
		);

		this.world.addObject(jumper, x, y);
	}
	, announceDeath: function(peaceful)
	{
		if(this.name && !peaceful)
		{
			if(this.lastDamagedBy)
			{
				this.world.game.message.blit(this.name + ' destroyed by ' + this.lastDamagedBy.name + '.');
			}
			else
			{
				this.world.game.message.blit(this.name + ' destroyed.');
			}
		}
	}
	, crush: function(crusher)
	{
		this.crusher = crusher;
	}
});
