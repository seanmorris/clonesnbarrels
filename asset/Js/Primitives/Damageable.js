var DamageableDef = {
	init: function(sprite, maxHealth, corpse)
	{
		this._super(sprite);
		this.setHealth(maxHealth || 25);
		this.corpse				= corpse;
		this.lastDamagedBy		= null;
	}
	, setHealth: function(health)
	{
		this.maxHealth			= health;
		this.health				= health;
		this.displayHealth		= health;
		this.displayHealthBar	= 0;
	}
	, update: function()
	{
		this._super();

		if(this.displayHealth == this.health
			&& this.displayHealthBar > 0
		){
			this.displayHealthBar--;
		}

		if(this.displayHealth < this.health)
		{
			this.displayHealth += 1;
		}
		else if(this.displayHealth > this.health)
		{
			this.displayHealth -= 1;
		}

		if(this.health <= 0)
		{
			this.destroy();
		}
	}
	, render:  function(context, x, y, xPos, yPos, size)
	{
		this._super(context, x, y, xPos, yPos, size);

		if(this.health > 0
		   && this.displayHealth > 0
			&& (this.displayHealth != this.health
				|| this.displayHealthBar > 0
			)
		){
			context.strokeStyle = "#000";
			context.strokeRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size) -10
				, (size - 10)
				, 3
			);
			context.globalAlpha = 0.7;
			context.fillStyle = "#F00";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size) -10
				, (size - 10)
				, 3
			);
			context.fillStyle = "#010";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size)-10
				, (size - 10) * (this.displayHealth / this.maxHealth)
				, 3
			);
			context.fillStyle = "#0F0";
			context.fillRect(
				xPos + this.getOffsetX(size) +10
				, yPos + this.getOffsetY(size)-10
				, (size - 10) * (this.health / this.maxHealth)
				, 3
			);
			context.fillStyle = '#0F0';
			context.font = 'bold 13pt monospace';
			context.fillText(
				Math.floor(this.displayHealth)
				, xPos + this.getOffsetX(size) + 10
				, yPos + this.getOffsetY(size) - 20
			);
			context.strokeStyle = '#040';
			context.lineWidth = 1;
			context.strokeText(
				Math.floor(this.displayHealth)
				, xPos + this.getOffsetX(size) + 10
				, yPos + this.getOffsetY(size) - 20
			);
			context.globalAlpha = 1;
		}
	}
	, damage: function(amount, other)
	{
		this._damage(amount, other);
	}
	, _damage: function(amount, other)
	{
		this.bumpNoise.play();
		// this.displayHealth = this.health;
		this.health -= amount;
		this.displayHealthBar = 50;
		this.lastDamagedBy = other;

		var healthDiff = this.displayHealth - this.health;

		if(healthDiff > 100)
		{
			healthDiff = 100;
		}

		this.displayHealth = this.health + healthDiff;

		console.log(this.name + ' damaged by ' + amount + '/' + this.maxHealth + ' points.');
	}
	, destroy: function(clean)
	{
		if(this.corpse && !clean)
		{
			this.world.addObject(
				this.corpse
				, this.x
				, this.y
			);

			if(this.corpse.damage && this.health < 0)
			{
				console.log(this.name + ' took over damage: ' + this.health);
				this.corpse.damage(-this.health)
			}
		}
		this._super(clean);
	}
	, getState: function()
	{
		this.stateVars.push('health');
		this.stateVars.push('maxHealth');
		this.stateVars.push('maxHealth');

		return this._super();
	}
};

var DamageableBindableDef = {
	push: function(pusher)
	{
		this.collide(pusher);

		pusher.collide(this);

		if(!this.heldBy && this.health > 0)
		{
			this.direction = pusher.direction;
			this.step(pusher.stepSpeed);
		}

		this.pusher = pusher;

		return this.canBePushed(pusher);
	}
};

var Damageable = Actor.extend(DamageableDef);
var DamageableBindable = Bindable.extend(DamageableDef).extend(DamageableBindableDef);
var DamageableCharacter = Character.extend(DamageableDef);
