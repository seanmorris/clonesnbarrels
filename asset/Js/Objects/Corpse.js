var Corpse = DamageableBindable.extend({
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite, maxHealth, corpse);

		this.ignoreControl = true;
	}
	, announceDeath: function()
	{
		if(this.lastDamagedBy && this.lastDamagedBy.name)
		{
			this.world.game.message.blit('Corpse destroyed by a ' + this.lastDamagedBy.name + '.', 350);
		}
		else
		{
			this.world.game.message.blit('Corpse destroyed.', 350);
		}
	}
	, vacuumDamage: function()
	{
		
	}
});
