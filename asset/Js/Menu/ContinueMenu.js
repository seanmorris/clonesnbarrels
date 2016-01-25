function ContinueMenu(game)
{
	var menu = new Menu(game);

	for(var i in menu)
	{
		if(menu[i] instanceof Function)
		{
			this[i]	= menu[i].bind(this);
			continue;
		}

		this[i]		= menu[i];
	}
	
	this.options				= [];
	this.options['continue']	= function()
	{
		game.restoreState();
	};
}
