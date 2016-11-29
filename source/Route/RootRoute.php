<?php
namespace SeanMorris\ClonesNBarrels\Route;
class RootRoute extends \SeanMorris\PressKit\Controller
{
	public $routes = [
		'map' => 'SeanMorris\ClonesNBarrels\Route\MapRoute'
		, 'saveState' => 'SeanMorris\ClonesNBarrels\Route\SaveStateRoute'
	];

	protected 
		$title = 'Clones N Barrels'
	;
	
	public function index($router)
	{
		throw new \SeanMorris\Ids\Http\HttpDocument(new \SeanMorris\ClonesNBarrels\View\Play);
	}
}
