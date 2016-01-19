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
		]
		, $readColumns = [
			'publicId' => 'HEX(%s)'
		]
		, $updateColumns = [
			'publicId' => 'UNHEX(%s)'
			, 'updated' => 'UNIX_TIMESTAMP()'
		]
		, $hasOne = [
			'state' => 'SeanMorris\PressKit\State'
		]
	;
}