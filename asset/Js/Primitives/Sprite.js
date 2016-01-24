var Sprite = Class.extend({
	standard: function()
	{
		return this.standing.south;
	}
	, clone: function()
	{
		var _this = this;
		var cloner = function(obj)
		{
			var clone = {};

			if(Array.isArray(obj))
			{
				clone = [];
			}

			for (var i in obj)
			{
				if(typeof obj[i] === 'object')
				{
					clone[i] = cloner(obj[i]);
				}
				else if(typeof obj[i] === 'function')
				{
					clone[i] = obj[i].bind(clone);
				}
				else
				{
					clone[i] = obj[i];
				}
			}

			return clone;
		};

		var clone = cloner(this);

		return clone;
	}
});