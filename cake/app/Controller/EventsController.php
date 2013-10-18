<?php
App::uses('AppController', 'Controller');
/**
 * Events Controller
 *
 * @property Event $Event
 */
class EventsController extends AppController {

    public $uses = array('Event','JobSeeker');

    public function index() {

        $userId = $this->Auth->user('id');
        $params = array(
            'conditions' => array(
                'Event.user_id' => $userId
            ),
            'recursive' =>0
        );
        $events = $this->Event->find('all',$params);

        $responseText = array();
        foreach ($events as $event) {
            $responseText[] = array(
                'id' => $event['Event']['id'],
                'title' => $event['Event']['title'],
                'url' => $event['Event']['url'],
                'text' => $event['Event']['text'],
                'enabled' => $event['Event']['enabled'],
            );
        }

        $this->responseText = $responseText;

        $this->render('json');
    }

    public function view($eventId) {

        $env = true;

        $event = array();
        $params = array(
            'conditions' => array(
                'Event.id' => $eventId
            ),
        );
        $event= $this->Event->find('first',$params);
        unset($event['Event']['user_id']);
        unset($event['Event']['created']);
        unset($event['Event']['modified']);

        $this->responseText= $event['Event'];

        $this->render('json');
    }

    public function add() {

        $title = $this->request->data['title'];
        $text = $this->request->data['text'];

        $rand =  md5(uniqid(rand(), true));
        $url = '/schedules/seeker/'.$rand;

        $savedata = array(
            'user_id' => $this->Auth->user('id'),
            'title' => $title,
            'text' => $text,
            'url' => $url
        );

        if($this->Event->save($savedata)) {
            $this->responseText = array(
                'id' => $this->Event->getLastInsertID()
            );
            $this->env = true;
        } else {
            $this->env = false;
        }

        $this->render('json');

    }

    public function edit($eventId) {
        $env = true;

        if($this->request->is('post') || $this->request->is('put')) {
            $this->Event->id = $eventId;
            if($this->Event->save($this->request->data)){
                $this->env = true;
            } else{
                $this->env = false;
            }
        }
        //$userId = $this->Auth->user('id');

        $event = array();
        $params = array(
            'conditions' => array(
         //       'Event.user_id' => $userId,
                'Event.id' => $eventId
            ),
        );
        $event= $this->Event->find('first',$params);
        unset($event['Event']['user_id']);
        unset($event['Event']['created']);
        unset($event['Event']['modified']);

        $this->responseText= $event['Event'];

        $this->render('json');

    }

    public function delete($eventId) {

        if($this->request->is('delete')) {
            $this->Event->id = $eventId;
            if($this->Event->delete()){
                $this->env = true;
            } else{
                $this->env = false;
            }
        }

        $this->render('json');

    }
    public function padule() {

    }
}
