import { Command,Flags } from '@oclif/core'
import 'dotenv/config'// 加载.env文件的内容
import chalk from 'chalk';
import { createChatCompletion } from '../../utils/openaiAPI/createChatCompletion.js';
import { startLoading, stopLoading } from '../../utils/loading.js';
import inquirer from 'inquirer'
import logUpdate  from 'log-update';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const CONFIG_PATH = path.join(os.homedir(), '.your-cli-config.json');

// 从配置文件中读取API密钥
function getApiKeyFromConfig(): string | null {
  if (fs.existsSync(CONFIG_PATH)) {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config.apiKey || null;
  }
  return null;
}

// 将API密钥保存到配置文件中
function saveApiKeyToConfig(apiKey: string): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey }));
}


export class MyCommand extends Command {
  static description = 'chat with the bot'

  static flags = {
    apiKey: Flags.string({ char: 'k', description: 'API key for the service' }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(MyCommand);

    let apiKey = flags.apiKey || getApiKeyFromConfig();

    if (!apiKey) {
      this.error('API key is required. Please provide it using the -k option.');
    }

     // 如果用户提供了新的API密钥，保存它
     if (flags.apiKey) {
      saveApiKeyToConfig(apiKey);
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
      apiKey = `Bearer ${apiKey}`; // 使用用户提供的或者之前保存的apiKey
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
