<?php
namespace SeanMorris\ClonesNBarrels\Route;
class RootRoute extends \SeanMorris\PressKit\Controller
{
	public $routes = [
		'saveState' => 'SeanMorris\ClonesNBarrels\Route\SaveStateRoute'
	];

	protected 
		$title = 'CnB'
	;
	
	public function index($router)
	{
		echo new \SeanMorris\ClonesNBarrels\View\Play;
		die();
	}
}
