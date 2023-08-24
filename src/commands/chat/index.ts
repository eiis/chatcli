import { Command,Flags } from '@oclif/core'
import 'dotenv/config'// 加载.env文件的内容
import chalk from 'chalk';
import { createChatCompletion } from '../../utils/openaiAPI/createChatCompletion.js';
import { startLoading, stopLoading } from '../../utils/loading.js';
import inquirer from 'inquirer'
import logUpdate  from 'log-update';

export class MyCommand extends Command {
  static description = 'chat with the bot'

  static flags = {
    apiKey: Flags.string({ char: 'k', description: 'API key for the service' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(MyCommand);

    if (!flags.apiKey) {
      this.error('API key is required. Please provide it using the -k option.');
      return;
    }

    const AIEmoji = '🤖';
    const UserEmoji = '👤';
    const welcomeMessage = chalk.green(`${AIEmoji}:您好,您可以向我提问任何问题,或者使用'bye'退出`);
    console.log(welcomeMessage)

     // output messages
     const messages: string[] = [];

     const chatMessages: {
       content: string;
       role: 'user' | 'assistant';
     }[] = [];

    while (true) {
      const { question } = await inquirer.prompt({
        type: 'input',
        name: 'question',
        message: `${UserEmoji}`,
      });

      if (question === 'bye') {
        console.log((`${AIEmoji}: Bye!`));
        break;
      }

      messages.push("");
      chatMessages.push({
        content: question,
        role: 'user',
      });

      startLoading('AI is thinking ...');
       const apiKey = flags.apiKey ? `Bearer ${flags.apiKey}` : '';
        const currentMessage = await createChatCompletion({
          apiKey,
          messages: chatMessages,
          onMessage: async(message) => {
            if (!message) {
              return;
            }
            stopLoading();
            logUpdate(chalk.green(`${AIEmoji}: ${message}`));
          }
        });

        if (!currentMessage) {
          chatMessages.push({
            content: currentMessage,
            role: 'assistant',
          });
        }

        logUpdate.done()
    }
    // const url = 'https://chat.fugui.info/v1/chat/completions'
    // // 定义固定的请求头
    // const headers = {
    //   'Authorization': `Bearer ${process.env.ENV_VARIBLE}`,
    //   'Content-Type': 'application/json',
    //   // ... 其他固定的请求头
    // };
    // const response = await axios.post(url,
    //   {
    //     "model": "gpt-3.5-turbo",
    //     "messages": [
    //       { "role": "user", "content": "你好" }
    //     ],
    //   },
    //   {
    //     headers: headers,
    //   }
    // );
    // this.log(JSON.stringify(response.data.choices[0].message.content));
  }
}
