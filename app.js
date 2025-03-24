const express = require('express');
const app = express();
const school = require('school.hana.js')

app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());

const axios = require("axios")

let userDatas = {}
let data = {}
app.post('/message', async (req, resS) => {
  try {
    const reqData = req.body.userRequest
    const question = reqData.utterance

    console.log("\n\n" + question + "\n\n")

    if (question === "새 채팅") {
      const chatID = await getChatId()

      userDatas[reqData.user.id] = chatID.chatId
      console.log("새 채팅: " + chatID.chatId)

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
      console.log('data: ' + JSON.stringify(data, null, 4))
      resS.json(data)
      return

    } else {
      if (!userDatas[reqData.user.id]) {
        const chatID = await getChatId()

        userDatas[reqData.user.id] = chatID.chatId
      }

      const now = new Date()
      const today = now.toISOString().slice(0, 10).replace(/-/g, "") + " " + now.toTimeString().slice(0, 5)

      const message = await getMessage({
        chatId: userDatas[reqData.user.id],
        message: "[" + today + "]\n" + question,
      })

      const response = message.response

      console.log("response: " + response)

      let keywords = response.split("keyword: [")[1]?.replaceAll("]", "").replaceAll("\n", "").split(",");
      let options = response.includes("option: [") ? response.split("option: [")[1].split("]")[0].split(",") : null
      let content = response.split("keyword: ")[0]?.trim().replaceAll("[홈페이지]", "https://syhs-h.goeujb.kr/syhs-h/main.do ")

      console.log("keywords: " + keywords, "options: " + options, "content: " + content)
      console.log("chatID: " + userDatas[reqData.user.id])

      if (!options) {
        data = {
          'version': '2.0',
          'template': {
            'outputs': [{
              'simpleText': {
                'text': content
              }
            }],
            'quickReplies': keywords.slice(0, 3).map(keyword => ({
              'label': keyword,
              'action': 'message',
              'messageText': keyword
            })).concat([{
              'label': "새 채팅",
              'action': 'message',
              'messageText': "새 채팅"
            }])
          }
        }
        console.log('data: ' + JSON.stringify(data, null, 4))
        resS.json(data)
        return
      } else {

        if (options[0] == "급식") {
          school.meal({
              ATPT_OFCDC_SC_CODE: 'J10',
              SD_SCHUL_CODE: '7531167',
              MMEAL_SC_CODE: "2",
              MLSV_YMD: options[1]
            })
            .then(res => {
              console.log(options[1], res)
              const dateF = formatDate(options[1])
              if (!res[0]) {
                data = {
                  "version": "2.0",
                  "template": {
                    "outputs": [
                      {
                        "listCard": {
                          "header": {
                            "title": dateF[1] + "월 " + dateF[2] + "일 (" + dateF[3] + ") 중식",
                          },
                          "items": [{
                            "title": "등록된 급식이 없습니다.",
                            "description": "공휴일, 개교기념일, 재량 휴업일은\n급식 정보가 제공되지 않습니다."
                          }], 
                          "buttons": [
                            {
                              "action": "webLink",
                              "label": "급식 전체 보기",
                              "webLinkUrl": "https://syhs-h.goeujb.kr/syhs-h/ad/fm/foodmenu/selectFoodMenuView.do"
                            }
                          ]
                        }
                      }
                    ],
                    "quickReplies": keywords.slice(0, 3).map(keyword => ({
                      "label": keyword,
                      "action": "message",
                      "messageText": keyword
                    })).concat([
                      {
                        "label": "새 채팅",
                        "action": "message",
                        "messageText": "새 채팅"
                      }
                    ])
                  }
                }                
                console.log('data: ' + JSON.stringify(data, null, 4))
                resS.json(data)
                return
              }
              let result = []
              res[0].DDISH_NM.split("<br/>").forEach(element => {
                result.push({
                  name: element.split("(")[0],
                  nature: element.split("(")[1]?.split(")")[0]
                })
              })
              let itemsLIST = []
              result.forEach(e => {
                itemsLIST.push({
                  "title": e.name.trim(),
                  "action": "message",
                  "messageText": e.name.trim() + "이 뭐야?",
                  "description": e.nature
                })
              })
              
              data = {
                "version": "2.0",
                "template": {
                  "outputs": [
                    {
                      "listCard": {
                        "header": {
                          "title": dateF[1] + "월 " + dateF[2] + "일 (" + dateF[3] + ") 중식",
                          "link": {}
                        },
                        "items": itemsLIST,
                        "buttons": [
                          {
                            "action": "webLink",
                            "label": "급식 전체 보기",
                            "webLinkUrl": "https://syhs-h.goeujb.kr/syhs-h/ad/fm/foodmenu/selectFoodMenuView.do"
                          }
                        ]
                      }
                    }
                  ],
                  "quickReplies": keywords.slice(0, 3).map(keyword => ({
                    "label": keyword,
                    "action": "message",
                    "messageText": keyword
                  })).concat([
                    {
                      "label": "새 채팅",
                      "action": "message",
                      "messageText": "새 채팅"
                    }
                  ])
                }
              }              
              console.log(result)
              console.log('data: ' + JSON.stringify(data, null, 4))
              resS.json(data)
              return
            })
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
              'quickReplies': keywords.slice(0, 3).map(keyword => ({
                'label': keyword,
                'action': 'message',
                'messageText': keyword
              })).concat([{
                'label': "새 채팅",
                'action': 'message',
                'messageText': "새 채팅"
              }])
            }
          }
          console.log('data: ' + JSON.stringify(data, null, 4))
          resS.json(data)
          return
        }
      }
    }
  } catch (err) {
    console.error(err)
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
              "description": err.toString()
            }]
          }
        }],
        'quickReplies': {
          'label': "재시도",
          'action': 'message',
          'messageText': question
        }
      }
    }
    console.log('data: ' + JSON.stringify(data, null, 4))
    resS.json(data)
    return
  }
})


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

function formatDate(dateString) {
  const date = new Date(
    dateString.slice(0, 4),
    dateString.slice(4, 6) - 1,
    dateString.slice(6, 8)
  );
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  return [
    date.getFullYear().toString(),
    (date.getMonth() + 1).toString(),
    date.getDate().toString(),
    dayNames[date.getDay()]
  ];
}
