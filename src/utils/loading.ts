import ora, { Ora } from 'ora';
import chalk from 'chalk';
import cliSpinners  from 'cli-spinners'

let spinner: Ora;

export function startLoading(text: string) {
  // console.log(cliSpinners)

  // 获取dwarfFortress微调器的所有帧
  const spinnerFrames = cliSpinners.earth.frames;

  spinner = ora({
    text: chalk.yellow(text),
    spinner: {
      frames: spinnerFrames,
      interval: 180 // 这是微调器帧之间的时间间隔，你可以根据需要调整
    }
  }).start();
}

export function stopLoading() {
  spinner && spinner.stop();
}
