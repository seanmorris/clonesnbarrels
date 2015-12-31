var PartySpawner = Actor.extend({
	init: function(party)
	{
		this.name = 'PartySpawner';
		this._super(new BarrelSprite);
		this.party = party;
		this.doNotStore = true;
	}
	, update: function()
	{
		this._super();

		if(
			this.world.canSpawn(this.x, this.y)
			&& this.party.length
		){
			this.world.addObject(
				this.party.pop()
				, this.x
				, this.y
			);
		}

		if(!this.party.length)
		{
			this.destroy(true);
			console.log('REMOVING PARTY SPAWNER');
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
