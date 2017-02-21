<?php 
namespace SeanMorris\ClonesNBarrels;
class Map extends \SeanMorris\PressKit\Model
{
	protected
		$id
		, $publicId
		, $class
		, $title
		, $mapdata
		, $created
		, $updated
		, $state
	;
	protected static
		$byPublicId = [
			'where' => [['publicId' => 'UNHEX(?)']]
		]
		, $table = 'ClonesNBarrelsMap'
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
			'state' => '\SeanMorris\ClonesNBarrels\State\MapState'
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