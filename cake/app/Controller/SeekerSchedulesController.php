<?php
App::uses('AppController', 'Controller');
/**
 * SeekerSchedules Controller
 *
 * @property Lock $Lock
 */
class SeekerSchedulesController extends AppController {

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
		$this->responseText = array(
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

        $this->render('json');
	}

	public function add() {
        $seekerId = $this->request->data['seeker_id'];
        $scheduleId = $this->request->data['schedule_id'];
        $type = $this->request->data['type'];

        $rand =  md5(uniqid(rand(), true));
        $url = '/locks/add/'.$rand;

        $savedata = array(
            'job_seeker_id' => $seekerId,
            'schedule_id' => $scheduleId,
            'type' => $type,
        );

        if($this->Lock->save($savedata)) {
            $this->responseText = array(
                'id' => $this->Lock->getLastInsertID()
            );
            $this->env = true;
        } else {
            $this->env = false;
        }

        $this->render('json');

	}

	public function edit($id) {
        $seekerId = $this->request->data['seeker_id'];
        $scheduleId = $this->request->data['schedule_id'];
        $type = $this->request->data['type'];

        $rand =  md5(uniqid(rand(), true));
        $url = '/locks/add/'.$rand;

        $savedata = array(
            'id' => $id,
            'job_seeker_id' => $seekerId,
            'schedule_id' => $scheduleId,
            'type' => $type,
        );

        if($this->Lock->save($savedata)) {
            $this->env = true;
        } else {
            $this->env = false;
        }

        $this->render('json');

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
