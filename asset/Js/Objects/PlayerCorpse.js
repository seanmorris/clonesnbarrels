var PlayerCorpse = Corpse.extend({
	crush: function(stepper)
	{
		this._super(stepper);
		this.damage(1, stepper);	
	}
});
