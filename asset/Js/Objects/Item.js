function Item(sprite)
{
	var actor		= new Actor(sprite);

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this.useFacing	= function()
	{
		this.world.game.stackState(
			'dialog'
			, {text: 'Picked up a ball.'}
			, true
		);

		this.destroy();
	}
}
