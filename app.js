const express = require('express');
const app = express();

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

const axios = require("axios")

let userDatas = {}

app.post('/message', async (req, res) => {
  let data = {}
  const reqData = req.body.userRequest
  const question = reqData.utterance;

  if (question == "새 채팅") {
    const chatID = await getChatId()

    userDatas[reqData.user.id] = chatID.chatId
    console.log(chatID.chatId)

    data = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "listCard": {
            "header": {
              "title": "새 대화가 시작되었습니다.",
              "link": {

              }
            }
          },
          "items": [
            {
              "title": "",
              "link": {
                
              },
              "description": chatID.chatId
            }],
        }]
      }
    }
  } else {
    if (!userDatas[reqData.user.id]) {
      const chatID = await getChatId()

      userDatas[reqData.user.id] = chatID.chatId
    }

    const message = await getMessage({
      chatId: userDatas[reqData.user.id],
      message: question,
    })

    const keywords = JSON.parse(message.response.split("keyword: ")[1])

    data = {
      'version': '2.0',
      'template': {
        'outputs': [{
          'simpleText': {
            'text': message.response.split("keyword: ")[0].trim()
          }
        }],
        'quickReplies': [{
            'label': keywords[0],
            'action': 'message',
            'messageText': keywords[0]
          },
          {
            'label': keywords[1],
            'action': 'message',
            'messageText': keywords[1]
          },
          {
            'label': keywords[2],
            'action': 'message',
            'messageText': keywords[2]
          }, {
            'label': "새 채팅",
            'action': 'message',
            'messageText': "새 채팅"
          }
        ]
      }
    }
  }
  res.json(data);
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
