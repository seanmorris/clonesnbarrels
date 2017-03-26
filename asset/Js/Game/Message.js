var Message = Class.extend({
	init: function(game)
	{
		this.game = game;
		this.messages = [];
		this.frame = 0;
	}
	, blit: function(string, displayFrames, color)
	{
		if(!displayFrames)
		{
			displayFrames = 150;
		}

		color = color || '55,55,55';

		if(color == 'good')
		{
			color = '55,105,0';
		}

		if(color == 'better')
		{
			color = '75,105,0';
		}

		if(color == 'warning')
		{
			color = '150,120,0';
		}

		if(color == 'damage')
		{
			color = '180,80,0';
		}

		this.messages.push({
			string:string
			, displayFrames:displayFrames
			, frame:0
			, color
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
		
		var spacing = 40;

		for(var i in this.messages)
		{
			this.messages[i].frame++;

			var messageWidth = context.measureText(this.messages[i].string);

			var alpha = Math.round(
				((this.messages[i].displayFrames - this.messages[i].frame) / this.messages[i].displayFrames) * 100
			) / 100;

			context.fillStyle = 'rgba('+this.messages[i].color+',' + alpha + ')';
			context.fillRect(
				center[0] - wRadius + spacing - 5
				, center[1] + hRadius + (spacing * ( i - this.messages.length ) ) - spacing + 10
				, messageWidth.width + 10
				, spacing
			);

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