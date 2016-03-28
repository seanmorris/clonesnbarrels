<?php 
namespace SeanMorris\ClonesNBarrels\Form;
class SaveStateForm extends \SeanMorris\Form\Form
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

		$skeleton['savedata'] = [
			'_title' => 'Save Data'
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

		$skeleton['submit'] = [
			'_title' => 'submit'
			, 'type' => 'submit'
		];

		parent::__construct($skeleton);
	}
}