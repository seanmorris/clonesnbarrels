var ExplosionNoise = new Audio('/SeanMorris/ClonesNBarrels/Sound/explosion.wav');
var Explosion = DamageableBindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new PitSprite(), 99);
		this.lastCollide		= null;
		this.doDamage			= 1000;
	}
	, reinit: function()
	{
		this.name = 'Explosion';
		this._super(new PitSprite(), 99);
		this.explosionNoise		= ExplosionNoise;
	}
	, update: function()
	{
		this.world.viewport.overlay('#FFF', 1);
		this.world.viewport.fadeOverlay(32);
		this.explosionNoise.play();
		
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
					tileObjects[j].explosionDamage(this.doDamage, this);
				}
				else if(tileObjects[j]
					&& tileObjects[j].damage
					&& tileObjects[j].damage instanceof Function
				){
					tileObjects[j].damage(this.doDamage, this);
				}
			}
		}

		this.world.addObject(
			new BlastMark
			, this.x
			, this.y
		);

		this.destroy();
	}
});