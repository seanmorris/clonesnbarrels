var ExplosionNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/explosion.wav');
var Barrel = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new BarrelSprite, 99);
		this.lastCollide		= null;
		this.doDamage			= 1000;
		this.tileOffsetY		= -4;
	}
	, reinit: function()
	{
		this.name = 'Barrel';
		this._super(new BarrelSprite, 99);
		this.explosionNoise		= ExplosionNoise;
	}
	, update: function()
	{
		this._super();

		if(this.health < this.maxHealth && !Barrel.warned)
		{
			/*
			this.world.game.stackState(
				'dialog'
				, {text: 'Don\'t knock those around.'}
				, true
			);
			*/
			Barrel.warned = true;
		}

		if(this.health <= 0)
		{
			this.world.viewport.overlay('#FFF', 1);
			this.world.viewport.fadeOverlay(32);
			this.explosionNoise.play();
			this.bumpNoise.play();

			var tile = this.world.getTile(this.x, this.y);
			var tiles = [tile, tile.up(), tile.down()
				, tile.left(), tile.right()
				, tile.right().up(), tile.right().down()
				, tile.left().up(), tile.left().down()
			];

			for(var i in tiles)
			{
				var tileObjects = tiles[i].objects();

				for(var j in tileObjects)
				{
					if(tileObjects[j]
						&& tileObjects[j].explosionDamage
						&& tileObjects[j].explosionDamage instanceof Function
					){
						tileObjects[j].explosionDamage(this.doDamage);
					}
					else if(tileObjects[j]
						&& tileObjects[j].damage
						&& tileObjects[j].damage instanceof Function
					){
						tileObjects[j].damage(this.doDamage);
					}
				}
			}
		}
	}
	, destroy: function(peaceful)
	{
		//console.log('Barrel explosion', this.x, this.y);
		this._super();
		if(this.lastCollide)
		{
			this.lastCollide.destroy();
		}
		if(!peaceful)
		{
			this.world.addObject(
				new BlastMark
				, this.x
				, this.y
			);
		}
	}
	, collide: function(other)
	{
		this._super(other);
		if(other instanceof Projectile && this.cheesed)
		{
			this.lastCollide = other;
		}
	}
	, crush: function(other)
	{
		//console.log('crush', other);
		this._super(other);
		this.damage(25);
	}
	, onStep: function()
	{
		if(this.cheesed)
		{
			this.damage(1);
		}

		return this._super();
	}
	, fireDamage: function(amount)
	{
		this.damage(amount*8);
	}
});
