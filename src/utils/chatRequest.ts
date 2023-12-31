import chalk from "chalk";
import { fetch } from 'undici'
import type { Response } from 'undici';
import {createParser, type ParsedEvent, type ReconnectInterval} from 'eventsource-parser';

interface ChatCompletionOptions {
  messages?: {
    content: string;
    role: "user" | "assistant";
  }[];
  onMessage: (data: string) => void;
  [x: string]: any;
}

export async function createChatCompletion(options:ChatCompletionOptions) {
  const { apiKey, onMessage, ...fetchOptions } = options;
  const authKey = apiKey ? `Bearer ${apiKey}` : '';
  const OPENAI_DOMAIN = 'https://chat.fugui.info'

  const response:Response= await fetch(`${OPENAI_DOMAIN}/v1/chat/completions`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: authKey,
    },
    method: 'POST',
    body: JSON.stringify({
      model: "gpt-3.5-turbo-16k",
      ...fetchOptions,
      stream: true,
    }),
  }).catch((err:Error) => {
    console.log(chalk.red(`Error: request error, ${err.message}`))
    throw err
  });

  if (!response?.ok) {
    console.log(chalk.red(`Error: request error, ${response.statusText}(${response.status})`))
    process.exit(1)
  }

  if (!response.body) {
    throw new Error('No data')
  }
  let currentMessage = '';

  //创建解析器实例
  const parser = createParser((event:ParsedEvent | ReconnectInterval) => {
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

  //提供数据流
  for await (const chunk of response.body as any) {
    //将Uint8Array 或 Buffer转成字符串
    const decoder = new TextDecoder('utf-8')
    parser.feed(decoder.decode(chunk))
  }

  return currentMessage;
}
