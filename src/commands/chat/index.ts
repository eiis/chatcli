import { Command } from '@oclif/core'
require('dotenv').config(); // 这行代码加载.env文件的内容到process.env中
// import axios from 'axios';
// import chalk from 'chalk';
// const chalk = require('chalk');
import { createChatCompletion } from '../../utils/openaiAPI/createChatCompletion';
// import { startLoading, stopLoading } from '../../utils/loading';
const inquirer = require('inquirer');
// const logUpdate = require('log-update');

export class MyCommand extends Command {
  // static description = 'description of this example command'
  static description = 'Query the API';

  async run(): Promise<void> {
    const AIEmoji = '👽';
    const UserEmoji = '🫣';
    const welcomeMessage = (`${AIEmoji}: Hi, I am ChatGpt, I can answer your questions. Ask me anything, or say "bye" to exit.`);
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

      // startLoading('AI is thinking ...');
       const apiKey = process.env.ENV_VARIBLE ? `Bearer ${process.env.ENV_VARIBLE}` : '';
        const currentMessage = await createChatCompletion({
          apiKey,
          messages: chatMessages,
          onMessage: async(message) => {
            if (!message) {
              return;
            }
            // stopLoading();
            this.log(`${AIEmoji}: ${message}`)
            // const logUpdate = await import('log-update')
            // console.log(logUpdate,'logUpdate')
            // logUpdate((`${AIEmoji}: ${message}`));
          }
        });
        // console.log(currentMessage,'currentMessage')

        if (!currentMessage) {
          chatMessages.push({
            content: currentMessage,
            role: 'assistant',
          });
        }

        // logUpdate.done()
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
