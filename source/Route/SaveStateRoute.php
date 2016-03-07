<?php 
namespace SeanMorris\ClonesNBarrels\Route;
class SaveStateRoute extends \SeanMorris\PressKit\Controller
{
	protected
		$title = 'Saves'
		, $modelClass = '\SeanMorris\ClonesNBarrels\SaveState'
		, $formTheme = 'SeanMorris\Form\Theme\Theme'
	;
	protected static
		$forms = [
			'edit' => 'SeanMorris\ClonesNBarrels\Form\SaveStateForm'
		]
	;
}