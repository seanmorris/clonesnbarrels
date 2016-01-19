<?php
namespace SeanMorris\ClonesNBarrels;
class Package extends \SeanMorris\Ids\Package
{
	protected static
		$assetManager = 'SeanMorris\Rhino\AssetManager'
		, $tables = [
			'main' => [
				'ClonesNBarrelsSaveState'
			]
		]
	;
}