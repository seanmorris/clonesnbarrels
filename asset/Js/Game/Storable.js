var Storable = Class.extend({
	init: function()
	{
		this.id = null;
		this.publicId = null;
		this.title = null;
		this.created = null;
		this.updated = null;
		this.messages = [];
	}
	, save: function()
	{
		var data = {};

		for(var i in this)
		{
			if(i.match(/^_/) || (this[i] instanceof Function))
			{
				continue;
			}

			data[i] = this[i];
		}

		var endpoint = this._endpoint
			+ '/'
			+ this.publicId
			+ '/edit?api';

		if(!this.publicId)
		{
			var endpoint = this._endpoint + '/create?api';
		}

		var _this = this;
		var success = false;

		$.ajax({
			url: endpoint
			, method: 'POST'
			, data: data
			, dataType: 'JSON'
			, async: false
			, success: function(data)
			{
				if(typeof data.body == 'undefined' || !data.body)
				{
					_this.messages = data.messages;
					return;
				}

				for(var i in _this)
				{
					if(!i.match(/^_/)
						&& data.body[i] !== undefined
						&& !(_this[i] instanceof Function)
					){
						_this[i] = data.body[i];
					}
				}

				success = true;
			}
		});

		return success;
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
				&& data.body[i] !== undefined
				&& !(this[i] instanceof Function)
			){
				this[i] = data.body[i];
			}
		}
	},
	getMessages: function()
	{
		var m = this.messages;
		this.messages = [];
		return m;
	}
});
