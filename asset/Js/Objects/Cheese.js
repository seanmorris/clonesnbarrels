var Cheese = Bindable.extend({
	init: function()
	{
		this.reinit();
		this._super(new CheeseSprite());
	}
	, reinit: function()
	{
		this.name = 'Cheese';
		this._super(new CheeseSprite());
	}
	, collide: function(other)
	{
		//console.log(other);
		this._super(other);
		if(other instanceof Projectile && !other.cheesed)
		{
			scaleColorFunc = this.scaleColors(
				0.2//Math.random()
				, 1.25//Math.random()
				, 1.75//Math.random()
				, 1
			);
			other.speed = 2;
			
			var stepRatio = other.stepTimer/other.stepTime;
			other.damage *= 4;
			//other.stepTimer = other.speed * stepRatio;
			//other.stepTime = other.speed;

			other.alterSprite(scaleColorFunc);
		}
		if(other instanceof Barrel && !other.cheesed)
		{
			scaleColorFunc = this.scaleColors(
				1.5//Math.random()
				, 0.75//Math.random()
				, 0.75//Math.random()
				, 1
			);
			other.speed = 4;
			other.alterSprite(scaleColorFunc);
			other.setHealth(5);
		}
		if(other instanceof WoodBox && !other.cheesed)
		{
			swapColorFunc = this.swapColors(0,0,0,3);
			other.alterSprite(swapColorFunc);
			other.setHealth(5);
		}
		if(other instanceof Cheese && !other.cheesed)
		{
			swapColorFunc = this.swapColors(
				2
				, 1
				, 0
				, 3
			);
			scaleColorFunc = this.scaleColors(
				0.1//Math.random()
				, 0.7//Math.random()
				, 1//Math.random()
				, 1
			);
			other.alterSprite(swapColorFunc);
			//other.alterSprite(scaleColorFunc);
		}
		if(other)
		{
			other.cheesed = true;
		}
	}
	, crush: function(other)
	{
		this._super(other);
		this.collide(other);
	}
});
