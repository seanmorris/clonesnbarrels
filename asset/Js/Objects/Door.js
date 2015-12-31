var Door = Actor.extend({
	init: function()
	{
		this.state = 'closed';
		this.reinit();
		this._super(new DoorSprite());
	}
	, reinit: function()
	{
		this._super(new DoorSprite());
	}
	, useFacing: function()
	{
		if(this.state == 'closed')
		{
			this.state = 'open';
			this.frames = this.sprite.open.south;
		}
		else if(this.state == 'open')
		{
			this.state = 'closed';
			this.frames = this.sprite.standing.south;
		}
	}
	, canBeSteppedOn: function()
	{
		return this.state == 'open';
	}
});
