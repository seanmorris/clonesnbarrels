<?php 
namespace SeanMorris\ClonesNBarrels\Route;
class MapRoute extends \SeanMorris\PressKit\Controller
{
	protected
		$title = 'Maps'
		, $modelClass = 'SeanMorris\ClonesNBarrels\Map'
		, $formTheme = 'SeanMorris\Form\Theme\Theme'
	;
	protected static
		$list = [
			'myMaps' => [
				'function' => 'byOwner'
				, 'params' => 'myMapsParams'
			]
		]
		, $forms = [
			'edit' => 'SeanMorris\ClonesNBarrels\Form\MapForm'
		]
	;
	
	protected function myMapsParams()
	{
		$user = \SeanMorris\Access\Route\AccessRoute::_currentUser();

		return [$user->id];
	}
}