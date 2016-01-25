function DialogMenuState(game)
{
	this.game		= game;

	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}

	this.onEnter	= function(params)
	{
		this.dialogMenu = new DialogMenu();

		if(params && params.text)
		{
			this.dialogMenu.dialog = new Dialog(game, params.text);
		}

		if(params && params.menu)
		{
			this.dialogMenu.menu = params.menu;
		}

		console.log(this.dialogMenu.menu.topMargin);
	}

	this._update = this.update;
	this.update = function()
	{
		this.dialogMenu.update({
			'keyStates'		: game.keyStates.slice(0)
			, 'mouseStates'	: game.mouseStates.slice(0)
			, 'scrollStates': game.scrollStates.slice(0)
			, 'clickVectors': game.clickVectors.slice(0)
		});
		this.dialogMenu.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
