var FloorActor = Actor.extend({
	init: function(sprite)
	{
		this._super(sprite);
		this.lastFrame = null;
		this.lastSprite = null;
		this.tileSet = false;
		this.refresh = false;
		this.persistent = false;
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function(context, x, y, xPos, yPos, size)
	{
		if(this.heldBy || this.stepping)
		{
			this.clearTile();
			this._super(context, x, y, xPos, yPos, size);
			return;
		}

		if(this.tileSet === false
			|| (this.frames
				&& this.frames[this.currentFrame]
				&& (this.frames[this.currentFrame] !== this.lastFrame
					|| this.sprite !== this.lastSprite
				)
			)
		){
			// this.clearTile();

			this.tileSet = this.world.addTile(
				this.x
				, this.y
				, [ this.frames[this.currentFrame] ]
				, false
				, this.tileSet ? this.tileSet.i : undefined
			);

			this.lastFrame = this.frames[this.currentFrame];
			this.lastSprite = this.sprite;
		}
	}
	, destroy: function(peaceful)
	{
		if(!this.persistent)
		{
			this.clearTile();
		}

		this._super(peaceful);
	}
	, clearTile: function()
	{
		if(this.tileSet !== false)
		{
			this.world.removeTile(
				this.tileSet.x
				, this.tileSet.y
				, this.tileSet.i
			);
			
			this.tileSet = false;
		}
	}
});

var FloorTrigger = FloorActor.extend(TriggerDef);

var StepTriggerDef = {
	update: function()
	{
		this._super();

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
				//&& coObjs[i].stepTimer === 0
				&& !coObjs[i].heldBy
				&& !skip
			){
				this.triggered = true;
				this.onTrigger(coObjs[i]);

				if(this.inverse)
				{
					this.triggered = false;
				}
			}
		}
	}
	, onTrigger: function(stepper)
	{

	}
};

var StepTrigger = FloorTrigger.extend(StepTriggerDef);
var FloorBindable = StepTrigger.extend(BindableDef);

