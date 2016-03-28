var Message = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.messages = [];
		this.frame = 0;
	}
	, blit: function(string, displayFrames)
	{
		if(!displayFrames)
		{
			displayFrames = 150;
		}
		this.messages.push({
			string:string
			, displayFrames:displayFrames
			, frame:0
		});
	}
	, update: function()
	{
		var width   = this.game.context.canvas.width;
		var height  = this.game.context.canvas.height;
		var wRadius = width/2;
		var hRadius = height/2;

		var context = this.game.context;
		var center	= [wRadius,hRadius];

		context.font = '22pt arial';
		
		var spacing = 24;

		for(var i in this.messages)
		{
			this.messages[i].frame++;

			var alpha = Math.round(
				((this.messages[i].displayFrames - this.messages[i].frame) / this.messages[i].displayFrames) * 100
			) / 100;

			context.strokeStyle = 'rgba(0,0,0,' + alpha + ')';
			context.strokeText(
				this.messages[i].string
				, center[0] - wRadius + spacing
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) )
			);

			context.fillStyle = 'rgba(255,255,255,' + alpha + ')';
			context.fillText(
				this.messages[i].string
				, center[0] - wRadius + spacing
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) )
			);
		}

		for(var i in this.messages)
		{
			if(this.messages[i].displayFrames <= this.messages[i].frame)
			{
				this.messages.splice(i, 1);
			}
		}

		this.frame++;
	}
});