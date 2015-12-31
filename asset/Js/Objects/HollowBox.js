var HollowBox = Box.extend({
	canBeSteppedOn: function(stepper)
	{
		return (stepper instanceof Box
			|| stepper instanceof Boxes
			|| stepper instanceof PolyWall
		);
	}
});
