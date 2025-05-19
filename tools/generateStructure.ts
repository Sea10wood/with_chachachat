import { glob } from 'glob'
import * as path from 'path'
import * as fs from 'fs'

async function generateFileStructure() {
  try {
    // appディレクトリ内の.tsxファイルを再帰的に検索
    const files = await glob('app/**/*.tsx', {
      ignore: ['**/node_modules/**', '**/.next/**']
    })

    // ファイル構造を生成
    const structure = files.map(file => {
      const relativePath = path.relative('app', file)
      const segments = relativePath.split(path.sep)
      
      return {
        path: relativePath,
        name: path.basename(file),
        level: segments.length
      }
    })

    // 出力ディレクトリの確認と作成
    const outputDir = path.resolve(__dirname, '../nextnav/public')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // JSONファイルとして保存
    const outputPath = path.join(outputDir, 'fileStructure.json')
    fs.writeFileSync(
      outputPath,
      JSON.stringify(structure, null, 2),
      'utf-8'
    )

    console.log('ファイル構造を生成しました:', outputPath)
    console.log('生成された構造:', structure)
  } catch (error) {
    console.error('エラーが発生しました:', error)
    process.exit(1)
  }
}

generateFileStructure() 