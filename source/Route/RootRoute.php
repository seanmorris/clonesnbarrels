<?php
namespace SeanMorris\ClonesNBarrels\Route;
class RootRoute extends \SeanMorris\PressKit\Controller
{
	public $theme = 'SeanMorris\ClonesNBarrels\Theme\Theme';
	public $routes = [
		'map' => 'SeanMorris\ClonesNBarrels\Route\MapRoute'
		, 'saveState' => 'SeanMorris\ClonesNBarrels\Route\SaveStateRoute'
	];

	protected 
		$title = 'Clones N Barrels'
	;
	
	public function index($router)
	{
		return new \SeanMorris\ClonesNBarrels\View\Play;
	}
}
