var Barrier = FloorTrigger.extend({
	init: function()
	{
		this._super(new BarrierSprite());
		this.reinit();
	}
	, reinit: function()
	{
		this.name = 'Barrier';
		this._super(new BarrierSprite());
		this.dontPortal = true;
		this.ignoreTypes = [
			Player
			, LaserBeam
			, FloorActor
		];
		this.dontIgnoreTypes = [
			Portal
		];
	}
	, update: function()
	{
		this.triggered = false;

		var coObjs = this.world.getObjects(this.x, this.y);

		coObjs:
		for(var i in coObjs)
		{
			if(coObjs[i] === this)
			{
				continue;
			}
			
			ignore:
			for(var j in this.ignoreTypes)
			{
				if(coObjs[i] instanceof this.ignoreTypes[j])
				{
					for(var k in this.dontIgnoreTypes)
					{
						if(coObjs[i] instanceof this.dontIgnoreTypes[k])
						{
							continue ignore;
						}
					}

					if(
						coObjs[i].stepping
						|| !coObjs[i].holding
						|| coObjs[i].holding instanceof this.ignoreTypes[j]
					){
						continue coObjs;
					}
				}
			}

			console.log(coObjs[i].name);

			this.trigger();

			/*
			var skip = false;

			for(var j in this.ignoreTypes)
			{
				if(coObjs[i] instanceof this.ignoreTypes[j])
				{
					skip = true;
				}
			}

			if(coObjs[i] !== this
				&& coObjs[i].stepTimer === 0
				&& !skip
			){
				//console.log(coObjs[i]);
				this.trigger();
			}
			*/
		}

		this._super();
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
