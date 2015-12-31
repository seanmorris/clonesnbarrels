var PolyWall = Triggerable.extend({
	init: function()
	{
		this.reinit();
		this.direction = 0;
		this.opened = false;
		this.breaking = false;
		this.children = [];
		this.hollowBox = null;
		this.hSprite = new BoxSprite;
		this.vSprite = new BoxesSprite;
		this._super(this.hSprite);
	}
	, reinit: function()
	{
		this.name = 'PolyWall';
		this.hSprite = new BoxSprite;
		this.vSprite = new BoxesSprite;
		this._super(this.hSprite);

		this.sprite = this.vSprite;
		this.preloadSprite();
		this.sprite = this.hSprite;
		this.opened = false;
	}
	, update: function()
	{
		if(this.direction % 2 && this.sprite !== this.vSprite)
		{
			this.sprite = this.vSprite;
		}

		if(!(this.direction % 2) && this.sprite !== this.hSprite)
		{
			this.sprite = this.hSprite;
		}

		this.frames = this.sprite.standard();

		this._super();

		var moving = false;

		for(var i in this.children)
		{
			if(this.children[i].stepping)
			{
				moving = true;
			}
		}

		if(this.stepping)
		{
			moving = true;
		}

		if(this.triggered && !moving)
		{
			this.opened = false;
		}

		if(this.triggered && !moving)
		{
			if(this.children.length)
			{
				for(var i in this.children)
				{
					if(this.children[i].x !== this.x
						|| this.children[i].y !== this.y
					){
						this.children[i].turn((this.direction+2)%4);
						this.children[i].step(6);
					}
					else
					{
						this.children[i].destroy(true);
						this.children.splice(i, 1);
					}
				}
			}
		}

		if(!this.triggered && !this.opened)
		{
			for(var i in this.children)
			{
				this.children[i].destroy(true);
			}

			this.children = [];

			var stepX = 0;
			var stepY = 0;

			if(this.direction == this.RIGHT)
			{
				stepX				= 1;
			}
			else if(this.direction == this.DOWN)
			{
				stepY				= 1;
			}
			else if(this.direction == this.LEFT)
			{
				stepX				= -1;
			}
			else if(this.direction == this.UP)
			{
				stepY				= -1;
			}

			var spawnX = parseInt(this.x) + parseInt(stepX);
			var spawnY = parseInt(this.y) + parseInt(stepY);
			var hitWall = false;

			while(this.world.canSpawn(spawnX, spawnY) || !hitWall)
			{
				var newBox;

				if(this.direction % 2)
				{
					var newBox = new Boxes();
				}
				else
				{
					newBox = new Box();
				}

				this.children.unshift(newBox);

				newBox.doNotStore = true;

				this.world.addObject(
					newBox
					, spawnX
					, spawnY
				);

				spawnX += stepX;
				spawnY += stepY;

				hitWall = false;

				if(!this.world.canSpawn(spawnX, spawnY))
				{
					if(blockers = this.world.getObjects(spawnX, spawnY))
					{
						for(var i in blockers)
						{
							if(blockers[i].damage
								&& blockers[i].damage instanceof Function
							){
								blockers[i].damage(10000);
							}
							else
							{
								blockers[i].push(10000);
							}
						}

						if(blockers[i].name == 'Box' || blockers[i].name == 'Boxes')
						{
							hitWall = true;
						}

					}
					else
					{
						hitWall = true;
					}
				}
			}

			this.opened = true;
		}
	}
	, canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
});
