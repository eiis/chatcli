import * as url from 'url'
import { readPackageUp } from 'read-pkg-up'

export const getPackageJson = async () => {
  const dirname = url.fileURLToPath(new URL('.', import.meta.url))

  //cwd 选项允许您指定从哪个目录开始向上查找 package.json 文件
  //如果不提供此选项，它将默认从当前工作目录
  const pkg = await readPackageUp({ cwd: dirname })
  const packageJson = pkg?.packageJson
  if (!packageJson) {
    throw new Error('package.json not found')
  }

  return packageJson
}

export const getPackageVersion = async () => {
  const packageJson = await getPackageJson()

  return packageJson.version
}

