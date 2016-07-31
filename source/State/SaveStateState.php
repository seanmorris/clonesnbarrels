<?php
namespace SeanMorris\ClonesNBarrels\State;
class SaveStateState extends \SeanMorris\PressKit\State
{
	protected static
		$states	= [
			0 => [
				'create'	=> 'SeanMorris\Access\Role\User'
				, 'read'	 => TRUE
				, 'update'	 => [TRUE, 'SeanMorris\Access\Role\User']
				, 'delete'	 => [TRUE, 'SeanMorris\Access\Role\Administrator']

				, '$class'	=> [
					'write'  => FALSE
					, 'read' => TRUE
				]

				, '$title'	=> [
					'write'  => [TRUE, 'SeanMorris\Access\Role\Administrator']
					, 'read' => TRUE
				]

				, '$savedata'	=> [
					'write'  => [TRUE, 'SeanMorris\Access\Role\Administrator']
					, 'read' => TRUE
				]
			]
		];
}
