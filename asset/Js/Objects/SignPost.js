function SignPost(text)
{
	var actor		= new Actor(new SignPostSprite());

	for(var i in actor)
	{
		this[i]		= actor[i];
	}

	this.text = text;
	this.used = false;

	this.useFacing	= function(user)
	{
		//console.log('!!!!! SIGNPOST: ' + this.text);
		this.used = true;
	}

	this.__update	= this.update;
	this.update     = function(input)
	{
		if(this.used)
		{
			this.used = false;
			this.world.game.stackState('dialog', {text: this.text});
		}

		this.__update();
	}
}
