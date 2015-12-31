var Barrier = Trigger.extend({
	init: function()
	{
		this._super(new BarrierSprite());
		this.reinit();
	}
	, reinit: function()
	{
		this.name = 'Barrier';
		this._super(new BarrierSprite());
		this.ignoreTypes = [
			Player
			, LaserBeam
			, FloorActor
		];
	}
	, update: function()
	{
		this.triggered = false;
		var coObjs = this.world.getObjects(this.x, this.y);

		for(var i in coObjs)
		{
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
		}

		this._super();
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
