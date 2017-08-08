var Corpse = DamageableBindable.extend({
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite, maxHealth, corpse);
		this.name = 'Corpse';
		this.ignoreControl = true;
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy && this.lastDamagedBy.name)
		{
			this.world.game.message.blit('Corpse destroyed by a ' + this.lastDamagedBy.name + '.');
		}
		else
		{
			this.world.game.message.blit('Corpse destroyed.');
		}
	}
	, vacuumDamage: function()
	{
		
	}
	, destroy: function(clean)
	{
		if(this.master)
		{
			this.master.removeParty(this)
		}
		
		this._super(clean);
	}
});
