var Projectile = Character.extend({
	init: function(sprite, damage, direction, speed)
	{
		this._super(sprite);
		this.damage = damage;
		this.direction = direction
		this.speed = speed;
	}
	, update: function()
	{
		this._super();

		var blocking = this.whyCantStep();

		if(!this.stepping && !this.canStep())
		{
			for(var i in blocking)
			{
				if(blocking[i] && blocking[i].collide)
				{
					this.collide(blocking[i]);
					blocking[i].collide(this);
					blocking[i].push(this);
				}
			}

			this.direction +=2;
			this.direction %=4;
		}

		if(!this.stepping)
		{
			this.step(this.speed);
		}
	}
	, collide: function(other)
	{
		this._super(other);
		if(other
		   && other.fireDamage
		   && other.fireDamage instanceof Function
		){
			other.fireDamage(this.damage, this)
		}
		else if(other
		   && other.damage
		   && other.damage instanceof Function
		){
			other.damage(this.damage, this)
		}
	}
	, canBeSteppedOn: function()
	{
		return true;
	}
});
