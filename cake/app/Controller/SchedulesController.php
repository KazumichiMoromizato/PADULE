<?php
App::uses('AppController', 'Controller');
/**
 * Schedules Controller
 *
 * @property Schedule $Schedule
 */
class SchedulesController extends AppController {

var $uses = array('Schedule','Lock','Event','User','JobSeeker');
 public function beforeFilter() {
        $this->Auth->allowedActions = array();
        parent::beforeFilter();
    }

/**
 * index method
 *
 * @return void
 */
	public function index() {
        $eventId = $this->request->query['event_id'];
        if(isset($this->request->query['seeker_id'])) {
            $seekerId = $this->request->query['seeker_id'];
        }

        $params = array(
            'conditions' => array(
                'Schedule.event_id' => $eventId,

            ),
            'recursive' =>2
        );
        if(!empty($seekerId)) {
            $this->Schedule->bindModel(array('hasMany'=>array('Lock'=>
                array(
                    'conditions' => array('Lock.job_seeker_id' => $seekerId),
                    )
                )
            ));
        } else {
            $this->Schedule->bindModel(array('hasMany'=>array('Lock'=>
                array(
                    )
                )
            ));
        }

        $this->Schedule->Lock->bindModel(array('belongsTo'=>array('JobSeeker')));

        $schedules = $this->Schedule->find('all',$params);
        $responseText = array();
        foreach ($schedules as $schedule) {

            $seekerSchedukes = array();
            foreach ($schedule['Lock'] as $lock) {
                $seekerSchedukes[] = array(
                    'id' => $lock['id'],
                    'type' => $lock['type'],
                    'seeker' => array(
                        'id' => $lock['JobSeeker']['id'],
                        'event_id' => $lock['JobSeeker']['event_id'],
                        'name' => $lock['JobSeeker']['username'],
                        'mail' => $lock['JobSeeker']['mail'],
                        'comment' => $lock['JobSeeker']['comment'],
                    ),
                );
            }
            $responseText [] = array(
                'id' => $schedule['Schedule']['id'],
                'event_id' => $schedule['Schedule']['event_id'],
                'start_time' => $schedule['Schedule']['start_datetime'],
                'end_time' => $schedule['Schedule']['end_datetime'],
                'seeker_schedules' =>$seekerSchedukes,
            );
        }

        $this->responseText = $responseText;
        $this->render('json');

	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {

	}

/**
 * add method
 *
 * @return void
 */
	public function add() {

        $eventId = $this->request->query['event_id'];

        $start_datetime = $this->request->data['start_time'];
        $end_datetime = $this->request->data['end_time'];

        $savedata = array(
            'event_id' => $eventId,
            'job_seeker_id' => 0,
            'start_datetime' => $start_datetime,
            'end_datetime' => $end_datetime
        );

        if($this->Schedule->save($savedata)) {
            $this->responseText = array(
                'id' => $this->Schedule->getLastInsertID()
            );
            $this->env = true;
        } else {
            $this->env = false;
        }

        $this->render('json');
	}

    public function delete($id) {

        $this->env = false;
        if(!$this->Lock->findByScheduleId($id)) {
            if($this->request->is('delete')) {
                $this->Schedule->id = $id;
                if($this->Schedule->delete()){
                    $this->env = true;
                }
            }
        }

        $this->render('json');

    }

	public function newpadule() {
		if ($this->request->is('post')) {
			$this->request->data['Event']['user_id'] = $this->Auth->user('id');

			if($this->Event->save($this->request->data['Event'])) {
				$eventId = $this->Event->getLastInsertId();
				foreach ($this->request->data['dates'] as $key => $value) {
					if(!empty($value)) {
						$this->Schedule->create();
						$tmpDate = split('&', $value);
						$startDate = $tmpDate[0];
						$endDate = $tmpDate[1];
						$saveData = array(
							'event_id' => $eventId,
							'start_datetime' => $startDate,
							'end_datetime' => $endDate,
						);
						$this->Schedule->save($saveData);
					}
				}

				$this->redirect(array('controller' => 'schedules','action' => 'complete','0' => $eventId));
			}
		}
	}
	public function complete($groupId) {
				$this->set('groupId',$groupId);
	}
	public function added() {

	}

    public function seeker($param = '') {

        if(!$event = $this->Event->find('first',array('conditions' => array('url' => $this->here)))) {
            throw new NotFoundException("不正なURLです。");
        }

        $this->set('eventId',$event['Event']['id']);
    }
}