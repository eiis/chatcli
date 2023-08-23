import { Command } from '@oclif/core'
require('dotenv').config(); // 这行代码加载.env文件的内容到process.env中
import axios from 'axios';

export class MyCommand extends Command {
  // static description = 'description of this example command'
  static description = 'Query the API';

  async run(): Promise<void> {
    // this.log(`MY_VARIABLE is: ${process.env.ENV_VARIBLE}`);

    const url = 'https://chat.fugui.info/v1/chat/completions'
    // 定义固定的请求头
    const headers = {
      'Authorization': `Bearer ${process.env.ENV_VARIBLE}`,
      'Content-Type': 'application/json',
      // ... 其他固定的请求头
    };
    const response = await axios.post(url,
      {
        "model": "gpt-3.5-turbo",
        "messages": [
          { "role": "user", "content": "你好" }
        ],
      },
      {
        headers: headers,
      }
    );
    this.log(JSON.stringify(response.data.choices[0].message.content));
  }
}
