<?php
namespace SeanMorris\ClonesNBarrels\Route;
class RootRoute extends \SeanMorris\PressKit\Controller
{
	public $top = TRUE;
	public $theme = 'SeanMorris\ClonesNBarrels\Theme\Theme';
	public $routes = [
		'map'         => 'SeanMorris\ClonesNBarrels\Route\MapRoute'
		, 'saveState' => 'SeanMorris\ClonesNBarrels\Route\SaveStateRoute'
		, 'user'      => 'SeanMorris\Access\Route\AccessRoute'
	];

	protected 
		$title = 'Clones N Barrels'
	;
	
	public function index($router)
	{
		return new \SeanMorris\ClonesNBarrels\View\Play;
	}

	public function close()
	{
    	return "<script>window.close();</script>";
	}
}
