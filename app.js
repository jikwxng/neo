const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const axios = require("axios")

let userDatas = {}

app.post('/message', async (req, res) => {
	let data = {}
  const reqData = req.body.userRequest
  const question = reqData.utterance;
  const goMain = '새 채팅';

  if (question == "새 채팅") {
    const chatID = await getChatId()

    userDatas[reqData.user.id] = chatID.chatId
    console.log(chatID.chatId)

    data = {
      'version': '2.0',
      'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': "➕ 새 채팅이 생성되었습니다."
	      }
	    }],
      }
    }
  } else {
    if (!userDatas[reqData.user.id]) {
      const chatID = await getChatId()

      userDatas[reqData.user.id] = chatID.chatId
    }

    const message = await getMessage({ chatId:  userDatas[reqData.user.id], message: question,  })

     data = {
      'version': '2.0',
      'template': {
	    'outputs': [{
	      'simpleText': {
	        'text': message.response
	      }
	    }],
	    'quickReplies': [{
	      'label': goMain,
	      'action': 'message',
	      'messageText': goMain
	    }]
      }
    }
  }
  res.json(data);
});

app.post('/meal', async (req, res) => {

  const today = new Date()

     data = 
     {
       "version": "2.0",
       "template": {
         "outputs": [
           {
             "listCard": {
               "header": {
                 "title": (today.getMonth + 1) + "월 " + today.getDate() + "일 (" + ["일","월","화","수","목","금","토"][today.getDay] + ") 중식",
                 "link": {
                   "web": ""
                 }
               },
               "items": [
                 {
                   "title": "삼치데리야끼구이",
                   "link": {
                     "web": ""
                   },
                   "description": "10,39,33,45,2,3"
                 }
               ],
               "buttons": [],
               "lock": false,
               "forwardable": true
             },
           }
         ],
         "quickReplies": []
       }
     }
  res.status(200).json(data);
});

app.listen(3000, () => console.log('node on 3000'));

async function getChatId() {
    const url = 'https://api.getgpt.app/api/v1/chats/new';
    const headers = {
        'Authorization': 'Bearer 0',
        'Content-Type': 'application/json'
    };
    const data = {
        app_id: 'xVzbkFgdtw',
    };
    const res = await axios.post(url, data, {
        headers
    })

    return {
        chatId: res.data
    }
}

async function getMessage({
    chatId = "",
    message = ""
}) {
    try {
        const url = 'https://api.getgpt.app/api/v1/chats';
        const headers = {
            'Authorization': 'Bearer 0',
            'Content-Type': 'application/json'
        };

        const data = {
            app_id: 'xVzbkFgdtw',
            chat_id: chatId,
            user_message: message
        };
        const res = await axios.post(url, data, {
            headers
        })
        return {
            chatId: chatId,
            message: message,
            response: res.data.split("[[START]]")[1]
        }
    } catch (e) {
        console.error(e)
    }
}
