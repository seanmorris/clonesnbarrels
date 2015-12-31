var Wanderer = DamageableCharacter.extend({
	init: function(sprite, backward)
	{
		this._super(sprite);
		this.backward = backward;
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
					this.turn((this.direction-- % 4));
				}
				else
				{
					this.turn((this.direction++ % 4));
				}
			}

			if(!this.step(this.stepSpeed))
			{
				this.turn((this.direction++ % 4));
			}
		}
	}
});
