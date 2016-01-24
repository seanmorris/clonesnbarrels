var Spritesheet = Class.extend({
	init: function()
	{
		this.urlPath = '/SeanMorris/ClonesNBarrels/Img/';
		
		this.imageUrl = 'free/spritesheet.png';
		this.boxesUrl = 'free/spritesheet.json';

		this.frames = {};

		this.boxes = $.ajax({
	        type: 'GET',
	        dataType: 'json',
	        url: this.urlPath + this.boxesUrl,
	        cache: false,
	        async: false
	    }).responseText;

	    this.boxes = JSON.parse	(this.boxes);

		this.image = new Image();
		this.image.src = this.urlPath + this.imageUrl;

		var _this = this;

		this.image.onload = function()
		{
			_this.processImage();			
		};

		console.log(this);
	}
	, processImage: function()
	{
		if(!this.boxes.frames)
		{
			return;
		}

		var canvas, context;

		canvas = document.createElement('canvas');
		canvas.width = this.image.width;
		canvas.height = this.image.height;

		context = canvas.getContext("2d");

		context.drawImage(this.image, 0, 0);

		//console.log(context.getImageData(0,0,this.image.width,this.image.height));

		for(var i in this.boxes.frames)
		{
			var subCanvas  = document.createElement('canvas');
			subCanvas.width = this.boxes.frames[i].frame.w;
			subCanvas.height = this.boxes.frames[i].frame.h;

			var subContext = subCanvas.getContext("2d");

			subContext.putImageData(context.getImageData(
				this.boxes.frames[i].frame.x
				, this.boxes.frames[i].frame.y
				, this.boxes.frames[i].frame.w
				, this.boxes.frames[i].frame.h
			), 0, 0);

			this.frames[this.boxes.frames[i].filename] = subCanvas.toDataURL();
		}
	}
	, getFrame: function(filename)
	{
		return this.frames[filename];
	}
});