// import chalk from "chalk";
// import { fetch } from 'undici'
// import axios from 'axios';
const {fetch} = require('undici');
// import { OPENAI_DOMAIN } from "../../constants.js";
// import { createParser } from 'eventsource-parser'
const {createParser} = require('eventsource-parser');
require('dotenv').config(); // 这行代码加载.env文件的内容到process.env中

export async function createChatCompletion(options: { [x: string]: any; messages?: { content: string; role: "user" | "assistant"; }[]; onMessage: (data: string) => void }) {
  const { apiKey, onMessage, ...fetchOptions } = options;
  // console.log(fetchOptions,apiKey,'fetchOptions');
  const authKey = apiKey ? apiKey : '';
  // console.log(authKey,'authKey');
  const OPENAI_DOMAIN = 'https://chat.fugui.info'

  const response = await fetch(`${OPENAI_DOMAIN}/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authKey,
    },
    method: 'POST',
    body: JSON.stringify({
      model: "gpt-3.5-turbo-16k",
      ...fetchOptions,
      stream: true,
    }),
  }).catch((err:any) => {
    // const chalk = await import('chalk');
    console.log((`Error: request openai error, ${err.message}`))
    throw err
  });

  // console.log(response,'response')

  if (!response?.ok) {
    console.log((`Error: request openai error, ${response.statusText}(${response.status}), May be more than the longest tokens`))
    process.exit(1)
  }

  if (!response.body) {
    throw new Error('No data')
  }

  let currentMessage = '';

  const parser = createParser((event:any) => {
    if (event.type === 'event') {
      const data = event.data
      if (data === '[DONE]') {
        return
      }
      const json = JSON.parse(data)

      const text = json.choices[0].delta?.content || ''

      currentMessage += text;

      onMessage(currentMessage)
    }
  })

  for await (const chunk of response.body as any) {
    const decoder = new TextDecoder('utf-8')
    parser.feed(decoder.decode(chunk))
  }

  return currentMessage;
}
