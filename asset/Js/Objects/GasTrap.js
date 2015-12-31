function GasTrap()
{
	var actor		= new Actor(new NullSprite());

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this._steppedOn	= this.steppedOn;
	this.steppedOn	= function()
	{
		/*
		this.world.game.stackState(
			'dialog'
			, {text: 'Lights out.'}
			, true
		);*/
/*
		this.world.viewport.overlay('#000', 0.5);
		this.world.viewport.fadeOverlay(50);
*/
		return true;
	}
}
