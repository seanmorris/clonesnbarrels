<?php
namespace SeanMorris\ClonesNBarrels\Route;
class SaveStateRoute extends \SeanMorris\PressKit\Controller
{
	public $alias = ['index' => 'mySaves'];
	protected
		$title = 'Saves'
		, $modelClass = 'SeanMorris\ClonesNBarrels\SaveState'
		, $formTheme = 'SeanMorris\Form\Theme\Theme'
	;
	protected static
		$forms = [
			'edit' => 'SeanMorris\ClonesNBarrels\Form\SaveStateForm'
		]
	;

	public function mySaves($router)
	{
		if($node = $router->path()->consumeNode())
		{
			$save = \SeanMorris\ClonesNBarrels\SaveState::loadOneByPublicId($node);

			if($router->request()->params('api'))
			{
				\SeanMorris\Ids\Log::debug($save);
				echo json_encode($save->unconsume(), JSON_PRETTY_PRINT);
				die;
			}

			if($theme = $this->_getTheme($router))
			{
				$viewClass = $theme::resolveFirst($this->modelClass);

				return new $viewClass(['object' => $save]);
			}
		}

		$user = \SeanMorris\Access\Route\AccessRoute::_currentUser();
		$saves = \SeanMorris\ClonesNBarrels\SaveState::getByOwner($user->id);

		if($router->request()->params('api'))
		{
			$links = [];

			foreach($saves as $save)
			{
				$links[$save->publicId] = [
					'url' => '/' . $router->path()->pathString() . '/' . $save->publicId
					, 'id' => $save->publicId
					, 'title' => $save->title
					, 'updated' => $save->updated
				];
			}

			echo json_encode($links, JSON_PRETTY_PRINT);
			die;
		}

		if($theme = $this->_getTheme($router))
		{
			$listViewClass = $theme::resolveFirst($this->modelClass, NULL, 'list');

			return new $listViewClass([
				'content'	=> $saves
				, 'path'	=> $router->path()->pathString()
				, 'columns'	=> ['id', 'title']
				, '_controller'	=> $this
				, '_router'	=> $router
			]);
		}
	}
}
