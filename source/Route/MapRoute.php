<?php 
namespace SeanMorris\ClonesNBarrels\Route;
class MapRoute extends \SeanMorris\PressKit\Controller
{
	protected
		$title = 'Maps'
		, $modelClass = '\SeanMorris\ClonesNBarrels\Map'
		, $formTheme = 'SeanMorris\Form\Theme\Form\Theme'
	;
	protected static
		$forms = [
			'edit' => 'SeanMorris\ClonesNBarrels\Form\MapForm'
		]
	;

	public function _dynamic($router)
	{
		echo new \SeanMorris\ClonesNBarrels\View\Play;
		die();
	}
}