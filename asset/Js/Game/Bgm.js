var Bgm = Class.extend({
	init: function()
	{
		this.playlist = [
			'/SeanMorris/ClonesNBarrels/Sound/533768_Bytestep.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/514068_N3Z-3---8-bit-crush.mp3'
			, '/SeanMorris/ClonesNBarrels/Sound/530471_Coins-8Bit.mp3'
		];

		this.playheader = 0;

		this.audio = null;
	}
	, play: function()
	{
		if(this.audio)
		{
			if(this.audio.paused)
			{
				this.audio.play();
			}
			else
			{
				this.audio.pause();
			}
		}
		else
		{
			this.audio = new Audio(this.playlist[this.playheader]);
			this.audio.play();
			var _this = this;
			this.audio.onended = function() {
				_this.next();
			};
		}
	}
	, next: function()
	{
		++this.playheader;

		if(this.playheader >= this.playlist.length)
		{
			this.playheader = 0;
		}

		this.audio.pause();

		delete this.audio;

		this.audio = new Audio(this.playlist[this.playheader]);

		this.play();

		var _this = this;
		this.audio.onended = function() {
			_this.next();
		};
	}
	, previous: function()
	{
		if(this.playheader < 0)
		{
			this.playheader = this.playlist.length - 1;
		}

		this.audio.pause();

		delete this.audio;

		this.audio = new Audio(this.playlist[this.playheader]);

		this.play();

		var _this = this;
		this.audio.onended = function() {
			_this.next();
		};
	}
});

var bgmSingleton = new Bgm;

var bgmPlayer = function() {
	return bgmSingleton;
};