<?php
namespace SeanMorris\ClonesNBarrels\State;
class MapState extends \SeanMorris\PressKit\State
{
	protected static
		$states	= [
			0 => [
				'create'	=> 'SeanMorris\Access\Role\Administrator'
				, 'read'	 => 1
				, 'update'	 => [1, 'SeanMorris\Access\Role\Moderator']
				, 'delete'	 => [1, 'SeanMorris\Access\Role\Administrator']
				, '$class'	=> [
					'write'  => 0
					, 'read' => 1
				]
				, '$title'	=> [
					'write'  => [1, 'SeanMorris\Access\Role\Moderator']
					, 'read' => 1
				]
				, '$mapdata' => [
					'write'  => [1, 'SeanMorris\Access\Role\Moderator']
					, 'read' => 1
				]
			]
		];
}