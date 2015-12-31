function ImageCache()
{
	this.images = [];
	this.loadImage = function(src, onLoad, reCallOnLoad)
	{
		if(
		   this.images[src]
		   && this.images[src].complete
		   && reCallOnLoad
		){
			var onLoadImg = this.images[src].onload;

			if(onLoad)
			{
				onLoad.apply(this.images[src]);
			}
			else if(onLoadImg)
			{

				onLoadImg.apply(this.images[src]);
			}
		}

		if(!this.images[src])
		{
			this.images[src] = new Image();
			this.images[src].onload = onLoad;
			this.images[src].src = src;
		}

		return this.images[src];
	}

	return this;
}

var imageCache = new ImageCache();
