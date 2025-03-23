const express = require('express');
const app = express();

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

const axios = require("axios")

let userDatas = {}

app.post('/message', async (req, res) => {
  try {
  let data = {}
  const reqData = req.body.userRequest
  const question = reqData.utterance;

  console.log("\n\n"+question+"\n\n")

  if (question == "새 채팅") {
    const chatID = await getChatId()

    userDatas[reqData.user.id] = chatID.chatId
    console.log("새 채팅: "+chatID.chatId)

    data = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "listCard": {
            "header": {
              "title": "새 대화가 시작되었습니다.",
              "link": {}
            },
            "items": []
          }
        }]
      }
    }
  } else {
    if (!userDatas[reqData.user.id]) {
      const chatID = await getChatId()

      userDatas[reqData.user.id] = chatID.chatId
    }

     const now = new Date();
     const today = now.toISOString().slice(0, 10).replace(/-/g, "") + " " + now.toTimeString().slice(0, 5);

    const message = await getMessage({
      chatId: userDatas[reqData.user.id],
      message: "["+today+"]\n"+question,
    })

    const response = message.response

    console.log("response:: "+response)

    const keywords = JSON.parse(response.split("keyword: ")[1]?.split("],")[0]+"]")
    const options = response.split("option: ")[1] ? JSON.parse(response.split("option: ")[1]) : null
    const content = response.split("keyword: ")[0]?.trim()

    console.log("keywords: "+keywords,"options: "+options,"content: "+content)
    console.log("chatID: "+userDatas[reqData.user.id])

    if (!options) {

      data = {
        'version': '2.0',
        'template': {
          'outputs': [{
            'simpleText': {
              'text': content
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
    } else {
      data = {
        'version': '2.0',
        'template': {
          'outputs': [{
            "listCard": {
              "header": {
                "title": "아직 구현중인 기능입니다.",
                "link": {}
              },
              "items": [{
                "title": options[0] + " 정보 제공",
                "link": {},
                "description": ''
              }]
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
  }
} catch(err) {
  data = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "listCard": {
          "header": {
            "title": "예상치 못한 오류가 발생했습니다.",
            "link": {}
          },
          "items": [{
            "title": "오류 내용",
            "link": {},
            "description": err
          }]
        }
      }]
    }
  };
}
    console.log('data: '+JSON.stringify(data, null, 4))
    res.json(data)
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
