function DialogState(game)
{
	var state		= new State();

	for(var i in state)
	{
		this[i]		= state[i];
	}
	
	this.dialog		= new Dialog(game);

	this.onEnter	= function(params)
	{
		if(params && params.text)
		{
			this.dialog = new Dialog(game, params.text);
		}
	}

	this._update = this.update;
	this.update = function()
	{
		this.dialog.update({
			'keyStates'		: game.keyStates.slice(0)
			, 'mouseStates'	: game.mouseStates.slice(0)
			, 'scrollStates': game.scrollStates.slice(0)
			, 'clickVectors': game.clickVectors.slice(0)
		});
		this.dialog.render();
		this._update();
	}

	this.onExit = function()
	{

	}
}
