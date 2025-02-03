import { GetPlanOutput } from '@/readingPlans';
import { LineMessage } from './types';

const formatDateString = (str: string): string => {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${str}`);
  }

  const daysOfWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayOfWeek = daysOfWeek[date.getDay()];

  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  return `${month}/${day} ${dayOfWeek}`;
};

export const toBubbleMessage = (arg: GetPlanOutput): LineMessage => {
  const { date, praise, repentence, devotional, prayer } = arg;

  return {
    type: 'flex',
    altText: `Bible Reading Plan for ${date}`,
    contents: {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        "contents": [
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "好好靈修",
                "color": "#1D292E",
                "size": "xl",
                "flex": 4,
                "weight": "regular",
                "align": "center",
                "contents": [],
                "offsetTop": "7%",
                "offsetEnd": "7%"
              },
              {
                "type": "text",
                "text": "1月",
                "margin": "none",
                "align": "start",
                "offsetBottom": "15%",
                "offsetStart": "6%"
              },
              {
                "type": "text",
                "text": "星期日",
                "offsetBottom": "9%",
                "align": "start",
                "offsetStart": "lg"
              },
              {
                "type": "text",
                "text": "DAILY",
                "offsetBottom": "43%",
                "offsetStart": "70%"
              },
              {
                "type": "text",
                "text": "DEVOTION",
                "offsetBottom": "37%",
                "offsetStart": "70%"
              },
              {
                "type": "text",
                "text": "x",
                "offsetStart": "60%",
                "offsetBottom": "72%",
                "size": "xxl"
              }
            ]
          }
        ],
        paddingAll: '20px',
        backgroundColor: '#FFCC32',
        spacing: 'md',
        paddingTop: '22px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        "contents": [
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "讚",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "25px",
                        "offsetBottom": "none",
                        "offsetStart": "none"
                      },
                      {
                        "type": "text",
                        "text": "美",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "45px"
                      }
                    ]
                  },
                  {
                    "type": "text",
                    "text": "普世要向耶和華歡呼！你們要歡然事奉耶和華，到祂面前來歡唱。\n要知道耶和華是上帝，祂創造了我們，我們屬於祂，是祂的子民，是祂草場上的羊。要懷著感恩的心進入祂的門，唱著讚美的歌進入祂的院宇；要感謝祂，稱頌祂的名。因為耶和華是美善的，祂的慈愛永遠長存，祂的信實千古不變。 (詩篇 100 CCB)",
                    "flex": 9,
                    "size": "xs",
                    "color": "#8c8c8c",
                    "wrap": true,
                    "gravity": "center",
                    "margin": "xxl"
                  }
                ],
                "offsetTop": "xl"
              },
              {
                "type": "text",
                "text": "───────────────────",
                "size": "xs",
                "color": "#FFFFFF",
                "align": "center"
              }
            ],
            "spacing": "lg",
            "paddingBottom": "none",
            "paddingTop": "none",
            "cornerRadius": "md",
            "backgroundColor": "#C7CADA"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "悔",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "5px",
                        "offsetBottom": "none",
                        "offsetStart": "none"
                      },
                      {
                        "type": "text",
                        "text": "改",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "15px"
                      }
                    ]
                  },
                  {
                    "type": "text",
                    "text": "在悔改的時間中,請邀請聖靈光照你思想:有沒有什麼是神要你去做卻沒有做的事?又有什麼是神不喜悅你去做,但你卻做了的事?請將這些事陳明在上帝的面前,並禱告尋求神的憐憫與寬恕,以及做出改變的行動。",
                    "flex": 9,
                    "size": "xs",
                    "color": "#8c8c8c",
                    "wrap": true,
                    "gravity": "center",
                    "margin": "xxl"
                  }
                ],
                "offsetTop": "xl"
              },
              {
                "type": "text",
                "text": "───────────────────",
                "size": "xs",
                "color": "#C7CADA",
                "align": "center"
              }
            ],
            "spacing": "lg",
            "paddingBottom": "none",
            "paddingTop": "none",
            "cornerRadius": "md",
            "backgroundColor": "#FFFFFF",
            "margin": "xxl"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "反",
                        "size": "lg",
                        "margin": "none",
                        "offsetStart": "md",
                        "offsetTop": "30px"
                      },
                      {
                        "type": "text",
                        "text": "思",
                        "size": "lg",
                        "align": "start",
                        "offsetStart": "md",
                        "offsetTop": "40px"
                      },
                      {
                        "type": "text",
                        "text": "出埃及記 第二十二章",
                        "flex": 9,
                        "size": "sm",
                        "margin": "none",
                        "wrap": true,
                        "action": {
                          "type": "postback",
                          "label": "action",
                          "data": "hello"
                        },
                        "offsetStart": "50px",
                        "position": "absolute",
                        "offsetTop": "30px"
                      },
                      {
                        "type": "text",
                        "text": "1. 你覺得神透過今天的經文對你說什麼呢？",
                        "size": "xs",
                        "color": "#8c8c8c",
                        "wrap": true,
                        "flex": 9,
                        "align": "start",
                        "gravity": "center",
                        "offsetStart": "50px",
                        "margin": "xs"
                      },
                      {
                        "type": "text",
                        "text": "2. 有什麼你可以做出的行動或改變呢？",
                        "size": "sm",
                        "color": "#8c8c8c",
                        "wrap": true,
                        "flex": 9,
                        "gravity": "center",
                        "offsetStart": "15%",
                        "margin": "xs"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "text",
                "text": "───────────────────",
                "size": "xs",
                "offsetBottom": "12px",
                "color": "#FFFFFF",
                "align": "center",
                "offsetStart": "10px"
              }
            ],
            "spacing": "lg",
            "paddingBottom": "none",
            "paddingTop": "none",
            "cornerRadius": "md",
            "backgroundColor": "#C7CADA",
            "offsetTop": "none",
            "margin": "xxl"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "祈",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "80px"
                      },
                      {
                        "type": "text",
                        "text": "求",
                        "size": "lg",
                        "align": "center",
                        "offsetTop": "95px"
                      }
                    ],
                    "offsetBottom": "50px"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "filler"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [],
                        "width": "2px",
                        "backgroundColor": "#E2E2E2",
                        "height": "100px",
                        "offsetTop": "50px"
                      },
                      {
                        "type": "filler"
                      }
                    ],
                    "flex": 1
                  },
                  {
                    "type": "text",
                    "text": "神啊！我將我的，___ ， ___ ， ___ 交給祢，我相信祢在這些事上掌權。\n『我們在天上的父：願人都尊你的名為聖。願你的國降臨；願你的旨意行在地上，如同行在天上。我們日用的飲食，今日賜給我們。免我們的債，如同我們免了人的債。不叫我們陷入試探；救我們脫離那惡者。因為國度、權柄、榮耀，全是你的，直到永遠。阿們！』",
                    "flex": 9,
                    "size": "xs",
                    "color": "#8c8c8c",
                    "wrap": true,
                    "gravity": "center",
                    "margin": "xxl"
                  }
                ],
                "offsetTop": "xl"
              },
              {
                "type": "text",
                "text": "───────────────────",
                "size": "xs",
                "color": "#C7CADA",
                "align": "center",
                "offsetStart": "10px"
              }
            ],
            "spacing": "lg",
            "paddingBottom": "none",
            "paddingTop": "none",
            "cornerRadius": "md",
            "backgroundColor": "#FFFFFF",
            "offsetTop": "xxl"
          }
        ],
      },
    },
  };
};
