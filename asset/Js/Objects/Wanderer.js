var Wanderer = DamageableCharacter.extend({
	init: function(sprite, maxHealth)
	{
		this._super(sprite, maxHealth);
		this.corpse = new Corpse(
			new PlayerCorpseSprite()
			, 250
			, new BloodStain()
		);
	}

	, update: function()
	{
		this._super();

		if(!this.stepping)
		{
			if(!this.canStep())
			{
				if(this.backward)
				{
					this.turn(((this.direction-1) % 4));
				}
				else
				{
					this.turn(((this.direction+1) % 4));
				}

				if(!this.canStep())
				{
					this.turn(((this.direction+2) % 4));
					this.backward = 1;
				}

				return;
			}

			if(!this.step(this.stepSpeed) || Math.random() < 0.2)
			{
				this.turn((this.direction+1 % 4));
			}
		}
	}
});
