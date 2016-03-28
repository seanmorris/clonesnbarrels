var Storable = Class.extend({
	init: function()
	{
		this.id = null;
		this.publicId = null;
		this.title = null;
		this.created = null;
		this.updated = null;
	}
	, save: function()
	{
		var data = {};

		for(var i in this)
		{
			if(!i.match(/^_/) && !(this[i] instanceof Function))
			{
				data[i] = this[i];
			}

			console.log(i, data);

		}
		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '/edit';

		if(!this.publicId)
		{
			var endpoint = this._endpoint + '/create?api';
		}

		var _this = this;

		$.ajax({
			url: endpoint
			, method: 'POST'
			, data: data
			, dataType: 'JSON'
			, success: function(data)
			{
				console.log(data);

				for(var i in _this)
				{
					if(!i.match(/^_/)
						&& data[i] !== undefined
						&& !(_this[i] instanceof Function)
					){
						_this[i] = data[i];
					}
				}

				// localStorage.setItem(_this._key, data.publicId);
			}
		});
	}
	, load: function(id)
	{
		if(id)
		{
			this.publicId = id;
		}		

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '?api';

		var _this = this;

		var data = JSON.parse($.ajax({
			url: endpoint
			, dataType: 'json'
			, async: false
		}).responseText);

		for(var i in this)
		{
			if(!i.match(/^_/)
				&& data[i] !== undefined
				&& !(this[i] instanceof Function)
			){
				this[i] = data[i];
			}
		}
	}
});