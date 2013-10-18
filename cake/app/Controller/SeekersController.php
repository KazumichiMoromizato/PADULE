<?php
App::uses('AppController', 'Controller');
/**
 * Locks Controller
 *
 * @property Lock $Lock
 */
class SeekersController extends AppController {

    var $uses = array('JobSeeker');

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
    public function view($id = null) {

        $seeker = $this->JobSeeker->read(null,$id);
        $this->responseText = array(
            'id' => $seeker['JobSeeker']['id'],
            'event_id' => $seeker['JobSeeker']['event_id'],
            'name' => $seeker['JobSeeker']['username'],
            'mail' => $seeker['JobSeeker']['mail'],
            'comment' => $seeker['JobSeeker']['comment'],
        );

        $this->render('json');

    }
    public function add() {

        $eventId = $this->request->data['event_id'];
        $username = $this->request->data['name'];
        $mail = $this->request->data['mail'];
        $comment = $this->request->data['comment'];

        $savedata = array(
            'event_id' => $eventId,
            'username' => $username,
            'mail' => $mail,
            'comment' => $comment
        );

        if($this->JobSeeker->save($savedata)) {
            $this->responseText = array(
                'id' => $this->JobSeeker->getLastInsertID()
            );
            $this->env = true;
        } else {
            $this->env = false;
        }

        $this->render('json');

    }
}