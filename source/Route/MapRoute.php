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
		if(array_key_exists('api', $_GET) || $router->path()->remaining() > 1)
		{
			return parent::_dynamic($router);
		}

		return new \SeanMorris\ClonesNBarrels\View\Play;
		die();
	}
}