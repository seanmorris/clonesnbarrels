function DialogMenu()
{
	this.context	= null;

	this.render = function()
	{
		if(!this.context)
		{
			this.context= this.dialog.game.canvas[0].getContext('2d');

			var width   = this.context.canvas.width;
			var height  = this.context.canvas.height;
		}

		this.dialog.render();

		//this.context.save();

		this.context.strokeStyle = '#FF0';
		this.context.strokeRect(
			0
			, (height/8)*3
			, width
			, (height/8)*2
		);

		//this.context.clip();

		this.menu.context = this.context;

		this.menu.leftMargin = 250;
		this.menu.topMargin = 200;
		this.menu.render(true);

		//this.context.restore();
	}

	this.update = function(input)
	{
		this.menu.update(input);
		this.dialog.update({});
	}
}
