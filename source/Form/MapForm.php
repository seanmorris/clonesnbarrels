<?php 
namespace SeanMorris\ClonesNBarrels\Form;
class MapForm extends \SeanMorris\Form\Form
{
	public function __construct()
	{
		$skeleton = [];

		$skeleton['_method'] = 'POST';

		$skeleton['id'] = [
			'_title' => 'Id'
			, 'type' => 'hidden'
		];

		$skeleton['publicId'] = [
			'_title' => 'PublicId'
			, 'type' => 'hidden'
		];

		$skeleton['title'] = [
			'_title' => 'Title'
			, 'type' => 'text'
		];

		$skeleton['mapdata'] = [
			'_title' => 'Map Data'
			, 'type' => 'textarea'
			, 'rows'   => 5
		];

		$skeleton['created'] = [
			'_title' => 'Created'
			, 'type' => 'text'
		];

		$skeleton['updated'] = [
			'_title' => 'Updated'
			, 'type' => 'text'
		];

		$skeleton['saveContinue'] = [
			'_title' => 'Save & Continue'
			, 'type' => 'submit'
		];

		$skeleton['saveView'] = [
			'_title' => 'Save & Play'
			, 'type' => 'submit'
		];

		$skeleton['saveExit'] = [
			'_title' => 'Save & Exit'
			, 'type' => 'submit'
		];

		parent::__construct($skeleton);
	}
};