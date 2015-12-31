var LaserBeam = Triggerable.extend({
	init: function(isntRoot)
	{
		this.damage = 200;
		this.child = null;
		this.isRoot = !isntRoot;
		this.reinit();
		this._super(new LaserBeamSprite());
	}
	, reinit: function()
	{
		this.name = 'LaserBeam';
		this._super(new LaserBeamSprite());
	}
	, update: function()
	{
		if(!this.triggered)
		{
			this.triggered = false;
		}

		this._super();

		if(!this.triggered && this.isRoot && this.child)
		{
			this.child.destroy(true);
			this.child = null;
		}

		if(!this.triggered && this.isRoot)
		{
			return;
		}

		var coObjs = this.world.getObjects(this.x, this.y);

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

		if(this.world.canSpawn(spawnX, spawnY) && !this.child)
		{
			newBeam = new LaserBeam(true);

			this.child = newBeam;

			this.child.doNotStore = true;

			this.world.addObject(
				newBeam
				, spawnX
				, spawnY
			);

			this.child.update();
		}
		else if(!this.world.canSpawn(spawnX, spawnY) && this.child)
		{
			this.child.destroy(true);
			this.child = null;
		}
		else if(!this.world.canSpawn(spawnX, spawnY) && !this.child)
		{
			var blockers = this.world.getObjects(spawnX, spawnY);

			for(var i in blockers)
			{
				if(
					blockers[i].laserDamage
					&& blockers[i].laserDamage instanceof Function
				){
					blockers.laserDamage(this.damage);
				}
				else if(
					blockers[i].damage
					&& blockers[i].damage instanceof Function
				){
					blockers[i].damage(this.damage);
				}
			}
		}
		else if(this.child && this.child.i === null)
		{
			this.child.destroy(true);
			this.child = null;
		}
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(this.triggered || !this.isRoot)
		{
			this._super(context, x, y, xPos, yPos, size);
		}
	}
	, destroy: function(clean)
	{
		if(this.child)
		{
			this.child.destroy(clean);
		}
		this._super(clean);
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, canSpawn: function()
	{
		return true;
	}
});
