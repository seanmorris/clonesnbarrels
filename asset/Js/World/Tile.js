function Tile(world, x, y)
{
	this.world	= world;
	this.x		= x;
	this.y		= y;

	this.right = function()
	{
		return this.world.getTile(this.x+1, this.y);
	}

	this.down = function()
	{
		return this.world.getTile(this.x, this.y+1);
	}

	this.left = function()
	{
		return this.world.getTile(this.x-1, this.y);
	}

	this.up = function()
	{
		return this.world.getTile(this.x, this.y-1);
	}

	this.objects = function()
	{
		return this.world.getObjects(this.x, this.y);
	}

	this.addObject = function(object)
	{
		return this.world.addObject(object,this.x,this.y);
	}

	this.removeObject = function(i)
	{
		return this.world.removeObject(this.x,this.y,i);
	}
}
