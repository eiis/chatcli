import chalk from "chalk";
import { fetch } from 'undici'
import {createParser, type ParsedEvent, type ReconnectInterval} from 'eventsource-parser';

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
    console.log(chalk.red(`Error: request openai error, ${err.message}`))
    throw err
  });

  if (!response?.ok) {
    console.log(chalk.red(`Error: request openai error, ${response.statusText}(${response.status}), May be more than the longest tokens`))
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
