<?php
namespace SeanMorris\ClonesNBarrels\Route;
class RootRoute implements \SeanMorris\Ids\Routable
{
	public function index($router)
	{
		echo new \SeanMorris\ClonesNBarrels\View\Play;
		die();
	}
}
