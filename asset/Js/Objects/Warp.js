var Warp = StepTrigger.extend({
	init: function()
	{
		this.toMap = null;
		this.toX = null;
		this.toY = null;
		this.name = 'Warp';
		this.reinit();
		this._super(new WarpSprite);
	}
	, reinit: function()
	{
		this._super(new WarpSprite);
	}
	, onTrigger: function(stepper)
	{
		if(stepper instanceof Player
			&& !(stepper instanceof PlayerClone)
			&& stepper.stepTimer == 0
		){
			this.world.viewport.overlay('#000', 0.9);
			this.world.viewport.fadeOverlay(5);

			console.log('WARP DIRECTION', stepper.direction);

			var spawnPartyX = 0;
			var spawnPartyY = 0;

			if(stepper.direction == stepper.RIGHT)
			{
				spawnPartyX			= -1;
			}
			else if(stepper.direction == stepper.DOWN)
			{
				spawnPartyY			= -1;
			}
			else if(stepper.direction == stepper.LEFT)
			{
				spawnPartyX			= 1;
			}
			else if(stepper.direction == stepper.UP)
			{
				spawnPartyY			= 1;
			}

			var party = stepper.getParty();
			var world = this.world;

			for(var i in party)
			{
				world.removeObject(
					party[i].x
					, party[i].y
					, party[i].i
				);
			}

			world.mapSet.switchMap(
				this.toMap
				, this.toX
				, this.toY
			);

			var partySpawner = new PartySpawner(party);

			world.addObject(
				partySpawner
				, this.toX + spawnPartyX
				, this.toY + spawnPartyY
			);

			partySpawner.update();
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
	, render: function()
	{

	}
});
