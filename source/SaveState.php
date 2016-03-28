<?php 
namespace SeanMorris\ClonesNBarrels;
class SaveState extends \SeanMorris\PressKit\Model
{
	protected
		$id
		, $publicId
		, $class
		, $title
		, $savedata
		, $created
		, $updated
		, $state
	;
	protected static
		$byPublicId = [
			'where' => [['publicId' => 'UNHEX(?)']]
		]
		, $table = 'ClonesNBarrelsSaveState'
		, $createColumns = [
			'publicId' => 'UNHEX(REPLACE(UUID(), "-", ""))'
			, 'created' => 'UNIX_TIMESTAMP()'
			, 'updated' => 'UNIX_TIMESTAMP()'
		]
		, $readColumns = [
			'publicId' => 'HEX(%s)'
		]
		, $updateColumns = [
			'publicId' => 'UNHEX(%s)'
			, 'updated' => 'UNIX_TIMESTAMP()'
		]
		, $hasOne = [
			'state' => '\SeanMorris\ClonesNBarrels\State\SaveStateState'
		]
		, $byOwner = [
			'join' => [
				'SeanMorris\PressKit\State' => [
					'on' => 'state'
					, 'by' => 'owner'
					, 'type' => 'INNER'
				]
			]
			, 'order' => [
				'updated' => 'DESC'
			]
		];
}