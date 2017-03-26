var BarrelHole = FloorTrigger.extend({
	init: function(maxBarrels)
	{
		this.name = 'BarrelHole';
		this.barrel		= null;
		this.state		= 'closed';
		this.maxBarrels = maxBarrels;
		if(!this.maxBarrels)
		{
			this.maxBarrels = 0;
		}
		this.barrels	= 0;
		this.frameTimer	= 1;
		this._super(new BarrelHoleSprite());
		this.reinit();
		this.justFilled = 0;
	}
	, reinit: function()
	{
		this._super(new BarrelHoleSprite());
	}
	, update: function()
	{
		var animComplete = false;
		if(this.currentFrame == this.frames.length -1)
		{
			animComplete = true;
		}

		var coObjs = this.world.getObjects(this.x, this.y);

		this.barrel = null;

		for(var i in coObjs)
		{
			if(
				coObjs[i].destroy
				&& coObjs[i] instanceof Barrel
			){
				this.barrel = coObjs[i];
			}
		}

		if(this.state == 'closed' && animComplete)
		{
			this.frames = this.sprite.standing.south;
		}

		if(this.state == 'open' && animComplete)
		{
			this.frames = this.sprite.open.south;
		}

		if(this.state == 'open' && animComplete && !this.barrel )
		{
			this.frames = this.sprite.closing.south;
			this.state = 'closed';
		}

		if(this.state == 'closed' && this.barrel &&(
			this.maxBarrels == 0
			|| this.maxBarrels > this.barrels
		)){
			this.state = 'open';
			this.frames = this.sprite.opening.south;
		}

		if(this.state == 'open'
			&& this.barrel
			&& !this.barrel.heldBy
			&& this.barrel.stepTimer < 2
		){
			this.barrels++;

			if(this.maxBarrels && this.maxBarrels > 1)
			{
				this.world.game.message.blit(
					'Fuel port '
					+ this.barrels
					+ '/'
					+ this.maxBarrels
					+ ' filled...'
				);
			}

			this.barrel.destroy(true);
			this.barrel = null;
			this.state = 'closed';
			this.frames = this.sprite.closing.south;
		}

		if(this.maxBarrels
			&& (this.state == 'closed'
				&& this.maxBarrels <= this.barrels
			)
		){
			this.state = 'sealing';
			this.frames = this.sprite.sealing.south;
			animComplete = false;
		}

		if(this.state == 'sealing' && animComplete)
		{
			this.frames = this.sprite.sealed.south;
		}

		if(this.barrels >= this.maxBarrels)
		{
			if(this.justFilled == 0)
			{
				this.world.game.message.blit(
					'Fuel port filled. Activating!'
					, 250
					, 'good'
				);
			}

			if(!this.justFilled)
			{
				this.justFilled++;		
			}
			
			this.trigger();
		}

		this._super();
	}
});
