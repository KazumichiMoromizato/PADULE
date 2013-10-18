 // フォーム #fm に対して検証ルールを登録 
$('#registerForms').validate({ 
  errorClass: 'invalid',
  rules: { 
    'company': { 
      required: true,    // 必須検証 
    }, 
    'name': { 
      required: true,    // 必須検証 
    }, 
    'agreement' : {
	    required: true,
    },
    'email': {
      required: true,
      email: true 
      }    // メールアドレス形式検証 
  },
  errorContainer: "#msg_alert",
  errorPlacement: function (error, element) {
   error.appendTo(element.parent("div").next("tdiv"));
    },
   
}); 
