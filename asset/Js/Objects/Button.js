var Button = StepTrigger.extend({
	init: function()
	{
		this.name = 'Button';
		this.reinit();
		this.origSprite = new ButtonSprite();
		this.otherSprite = new ButtonActivatedSprite();

		this._super(this.origSprite);
	}
	, reinit: function()
	{
		this.origSprite = new ButtonSprite();
		this.otherSprite = new ButtonActivatedSprite();

		this._super(this.origSprite);

		this.sprite = this.otherSprite;
		this.preloadSprite();
		this.sprite = this.origSprite;
	}
	, update: function()
	{
		this._super();

		if(this.triggered && this.sprite !== this.otherSprite)
		{
			this.sprite = this.otherSprite;
			this.preloadSprite();

			this.frames = this.sprite.standard();
		}
		else if(!this.triggered && this.sprite !== this.origSprite)
		{
			this.sprite = this.origSprite;
			this.preloadSprite();
		}

		this.frames = this.sprite.standard();
	}
});
