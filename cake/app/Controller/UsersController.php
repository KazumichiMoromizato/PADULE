<?php
App::uses('AppController', 'Controller');
App::uses('CakeEmail', 'Network/Email');

/**
 * Users Controller
 *
 * @property User $User
 */
class UsersController extends AppController {

var $uses = array('User','Company','TmpUser');

/**
 * index method
 *
 * @return void
 */
	public function index() {
		if(empty($this->login)) {
			$this->redirect('/');
		}
		pr($this->User->findById($login));
	}

/**
 * view method
 *
 * @throws NotFoundException
 * @param string $id
 * @return void
 */
	public function view($id = null) {
        $user = $this->User->read(null,$id);
        $this->responseText = array(
            'id' => $user['User']['id'],
            'name' => $user['User']['username'],
        );

        $this->render('json');
	}

/**
 * add method
 *
 * @return void
 */
	public function add() {
		if ($this->request->is('post')) {
        //$this->request->data['User']['username'] = 'padule@padule.me';
        //$this->request->data['User']['password'] = 'padule';
        $this->request->data['User']['company_id'] = 1;
        $this->request->data['User']['password'] = AuthComponent::password($this->request->data['User']['password']);

			$this->User->create();
			if ($this->User->save($this->request->data)) {
				$userId = $this->User->getLastInsertId();
				//$this->Session->write('login',$userId);
				$this->redirect(array('controller' => 'users','action' => 'complete'));
			} else {

			}
		}
	}

    public function login() {

            if($this->Auth->user()) {
                return $this->redirect($this->Auth->redirect());
            }
            if($this->request->is('post')) {
                if ($this->Auth->login()) {
                    return $this->redirect($this->Auth->redirect());
                } else {
                    $this->Session->setFlash(__('Username or password is incorrect'), 'default', array(), 'auth');
                }
            }
    }
    public function complete() {
    	
	}
	public function logout() {
	   $this->redirect($this->Auth->logout());
	}

    public function api_view($id = null) {

        $user = $this->User->read(null,$id);
        $responseText = array(
            'id' => $user['User']['id'],
            'name' => $user['User']['username'],
        );
        $url = $this->here;

        $this->set(compact('responseText','url'));
    }

    public function api_login() {
        $this->request->data['username'] = 'padule@padule.me';
        $this->request->data['password'] = 'padule';

        $this->request->data['User']['username'] = $this->request->data['username'];
        $this->request->data['User']['password'] = $this->request->data['password'];
        if ($this->Auth->login()) {
            $env['success'] = true;
        } else {
            $env['success'] = false;
        }

        $this->set(compact('env'));
    }

    public function api_chenge() {
        $this->request->data['username'] = 'padule@padule.me';
        $this->request->data['password'] = 'padule';
        $this->request->data['password'] = AuthComponent::password($this->request->data['password']);

        $this->request->data['new'] = 'padule2';
        $this->request->data['new'] = AuthComponent::password($this->request->data['new']);

        $params = array(
            'conditions' => array(
                'username' => $this->request->data['username'],
                'passowrd' => $this->request->data['password'],
            ),
        );

        $user = $this->User->find('first',$params);
        if(!empty($user)) {
            $this->User->id = $user['User']['id'];
            $savedata = array(
                'password' => $this->request->data['new'],
            );
        }


        $this->set(compact('env'));
    }

    public function regist() {
        if ($this->request->is('post')) {
/*
        $this->request->data['TmpUser']['username'] = 'moro';
        $this->request->data['TmpUser']['company'] = 'moro inc.';
        $this->request->data['TmpUser']['mail'] = 'k.moromizato@lexues.co.jp';
*/
            $this->TmpUser->create();
            if ($this->TmpUser->save($this->request->data)) {
                $Email = new CakeEmail();
                $Email->config('regist');
                $Email->to($this->request->data['TmpUser']['mail']);
                $Email->viewVars($this->request->data['TmpUser']); //送信内容をテンプレートファイルに渡します
                /*
                if($Email->send()){
                    //メール送信が成功した場合ここで処理
                }
                */
                $this->redirect('/users/complete');
            } else {
                $this->redirect('/index.html');

            }
        }
    }

}