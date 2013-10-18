<?php
App::uses('AppController', 'Controller');
/**
 * Locks Controller
 *
 * @property Lock $Lock
 */
class LocksController extends AppController {

    var $uses = array('Lock','User','Event','JobSeeker','Schedule');

	/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {

		$this->Lock->bindModel(array('belongsTo'=>array('JobSeeker')));
		$lock = $this->Lock->read(null,$id);
		$responseText = array(
			'id' => $lock['Lock']['id'],
			'schedule_id' => $lock['Lock']['schedule_id'],
			'type' => $lock['Lock']['type'],
			'seeker' => array(
				'id' => $lock['JobSeeker']['id'],
				'event_id' => $lock['JobSeeker']['event_id'],
				'name' => $lock['JobSeeker']['username'],
				'mail' => $lock['JobSeeker']['mail'],
				'comment' => $lock['JobSeeker']['comment'],
			),
		);
        $url = $this->here;

		$this->set(compact('responseText','url'));
	}

	public function add() {
		//pr($this->data);
		$error = null;
		$this->JobSeeker->begin();
		$success = true;
		if(!$this->JobSeeker->save($this->request->data['JobSeeker'])) {
			$success = false;
		}
		if($success) {
			$JobSeekerId = $this->JobSeeker->getLastInsertId();
			foreach ($this->request->data['Lock'] as $key => $value) {
				$value['job_seeker_id'] = $JobSeekerId;
				$this->Lock->create();
				if (!$this->Lock->save($value)) {
					$success = false;
				}
			}
		}

		if($success) {
			$this->JobSeeker->commit();
 			$env['success'] = true;
		} else {
			$this->JobSeeker->rollback();
			$env['success'] = false;
		}

		$this->set(compact('env'));
	}

	public function approval ($lockId) {

		$params = array(
			'conditions' =>array(
				'Lock.id' => $lockId
			),
			'recursive' => 2
		);
		$lock = $this->Lock->find('first',$params);

		$lock['Lock']['approval'] = true;
		$this->Lock->save($lock['Lock']);

		$lock['Schedule']['complete'] = true;
		$this->Schedule->save($lock['Schedule']);

		$lock['JobSeeker']['complete'] = true;
		$this->JobSeeker->save($lock['JobSeeker']);

		$this->redirect(array('controller' => 'schedules','action' => 'view',0 => $lock['Schedule']['Group']['id']));
	}
}
