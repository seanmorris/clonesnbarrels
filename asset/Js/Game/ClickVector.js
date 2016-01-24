function ClickVector(mouseState, deadZone)
{
	this.startX 	= mouseState[0];
	this.endX		= mouseState[0];
	this.startY		= mouseState[1];
	this.endY		= mouseState[1];

	window.mouseX = mouseState[0];
	window.mouseY = mouseState[1];

	this.deadZone	= deadZone || 20;
	this.age		= 0;

	this.x			= 0;
	this.y			= 0;

	this.magnitude	= null;
	this.theta		= null;

	this.RIGHT	= 0;
	this.DOWN	= 1;
	this.LEFT	= 2;
	this.UP		= 3;

	this.EAST	= this.RIGHT;
	this.SOUTH	= this.DOWN;
	this.WEST	= this.LEFT;
	this.NORTH	= this.UP;

	this.size	= 60;
	this.inidcatorSize = this.size;
	this.margin = this.inidcatorSize*1.6;

	this.alpha = 0.4;

	this.released = false;

	this.undragged = true;

	this.release = function()
	{
		this.released = true;
	}

	this.active		= function()
	{
		return !this.released
			&& this.magnitude > this.deadZone;
	}

	this.cardinal	= function()
	{
		if(
			Math.abs(this.y) > Math.abs(this.x)
			&& this.y > 0
		){
			return this.UP;
		}

		if(
			Math.abs(this.y) < Math.abs(this.x)
			&& this.x < 0
		){
			return this.RIGHT;
		}

		if(
			Math.abs(this.y) > Math.abs(this.x)
			&& this.y < 0
		){
			return this.DOWN;
		}

		if(
			Math.abs(this.y) < Math.abs(this.x)
			&& this.x > 0
		){
			return this.LEFT;
		}

		return 0;
	}

	this.update		= function(newMouseState)
	{
		this.endX	= window.mouseX;
		this.endY	= window.mouseY;

		this.x		= this.startX - this.endX;
		this.y		= this.startY - this.endY;

		this.magnitude = Math.sqrt(
			(this.x * this.x) + (this.y * this.y)
		);

		if(this.magnitude > this.deadZone)
		{
			this.undragged = false;
		}

		this.theta	= this.x ? Math.atan(this.y/this.x) : 1.5*Math.PI;

		if(this.x > 0)
		{
			this.theta += Math.PI;
		}

		this.age++;
	}

	this.render		= function(context)
	{
		context.lineWidth = 3;

		context.globalAlpha = this.alpha;

		context.beginPath();
		context.strokeStyle = "#FFF";
		context.arc(
			this.startX - $(context.canvas).offset().left
			, this.startY - $(context.canvas).offset().top
			, this.size
			, 0
			, 2*Math.PI
		);

		context.fillStyle = '#CA0';

		if(!this.active())
		{
			context.fillStyle = '#C55';
			context.fill();
		}
		else
		{
			context.beginPath();
/*			
			context.moveTo(
				this.endX - $(context.canvas).offset().left
				, this.endY - $(context.canvas).offset().top
			);
			context.lineTo(
				(this.startX - $(context.canvas).offset().left)
					+ Math.cos(this.theta) * this.margin
				, (this.startY - $(context.canvas).offset().top)
					+ Math.sin(this.theta) * this.margin
			);
			context.lineWidth = 7;
			context.strokeStyle = '#333';
			context.stroke();
			context.lineWidth = 3;
			context.strokeStyle = '#CA0';
			context.stroke();
 /*/
 //*/			
 			this.renderQuads(context);
		}

		context.globalAlpha = 1;

		context.strokeStyle = '#333';

		context.beginPath();

		context.arc(
			this.startX - $(context.canvas).offset().left
			, this.startY - $(context.canvas).offset().top
			, this.deadZone
			, 0
			, 2*Math.PI
		);

		context.stroke();
	}

	this.renderQuads = function(context)
	{
		for(var i in [0,1,2,3])
		{
			context.beginPath();

			context.moveTo(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
			);

			context.arc(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
				, i == this.cardinal() ?
					this.inidcatorSize
					: this.deadZone
				, (i ? ((i*0.5)-0.25) : 0.25) * Math.PI
				, (i ? ((i*0.5)+0.25) : 0.75) * Math.PI
			);

			context.lineTo(
				this.startX - $(context.canvas).offset().left
				, this.startY - $(context.canvas).offset().top
			);

			if(i == this.cardinal())
			{
				context.fillStyle = '#C55';
			}
			else
			{
				context.fillStyle = '#CA0';
			}

			context.fill();
		}
	}
}
