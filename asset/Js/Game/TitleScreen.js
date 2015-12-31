var TitleScreen = function(game)
{
	this.titleImg = imageCache.loadImage('/SeanMorris/ClonesNBarrels/Img/titleScreen.png');

	this.render = function()
	{
		var width   = game.context.canvas.width;
		var height  = game.context.canvas.height;

		var context = game.context;
		var center	= [width/2,height/2];

		context.fillStyle = '#000';
		context.fillRect(
			0, 0, width, height
		);
		if(this.titleImg.complete)
		{
			game.context.drawImage(
				this.titleImg
				, center[0] - this.titleImg.width/2
				, center[1] - this.titleImg.height/2
			);
		}
	}
}
