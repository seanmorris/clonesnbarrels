function MenuState(game)
{
	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.menu		= new MainMenu(game);

	this.onEnter = function(params)
	{
		if(params && params.menu)
		{
			this.menu = params.menu;
		}

		this.menu.flushBg();
	}

	this._update = this.update;
	this.update = function()
	{
		this.menu.update();
		this.menu.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
