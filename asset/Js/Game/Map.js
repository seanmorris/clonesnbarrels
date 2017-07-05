var MapStorable = Storable.extend({
	init: function()
	{
		this.mapdata = null;
		
		this._endpoint = '/map';
	}
});