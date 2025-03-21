const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/keyboard', (req, res) => {
  const data = {'type': 'text'}
  res.json(data);
});

app.post('/message', (req, res) => {
	let data = {}
	console.log(0)
  const question = req.body.userRequest.utterance;
  const goMain = '처음으로';

	console.log(question)
  
     data = {
      'version': '2.0',
      'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': '테스트'
	      }
	    }],
	    'quickReplies': [{
	      'label': goMain,
	      'action': 'message',
	      'messageText': goMain
	    }]
      }
    }
  res.json(data);
});

app.listen(3000, () => console.log('node on 3000'));
