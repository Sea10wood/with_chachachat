import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

// 除外するディレクトリとファイル
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  'out/**',
  'public/**',
  'scripts/**',
  '.git/**',
  '**/*.d.ts',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

// 対象とするファイル拡張子
const TARGET_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

interface FileNode {
  path: string;
  name: string;
  level: number;
}

async function generateFileStructure(): Promise<void> {
  try {
    // プロジェクトのルートディレクトリを取得
    const rootDir = process.cwd();

    // 対象ファイルを検索
    const files = await glob('**/*.{tsx,ts,js,jsx}', {
      ignore: EXCLUDE_PATTERNS,
      cwd: rootDir,
    });

    // ファイル構造を生成
    const structure: FileNode[] = files.map(file => {
      const relativePath = path.relative(rootDir, file);
      const dirs = relativePath.split(path.sep);
      const level = dirs.length - 1;
      const name = path.basename(file, path.extname(file));

      return {
        path: relativePath,
        name,
        level,
      };
    });

    // 出力ディレクトリの確認と作成
    const outputDir = path.join(rootDir, 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSONファイルとして保存
    const outputPath = path.join(outputDir, 'fileStructure.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(structure, null, 2),
      'utf-8'
    );

    console.log('ファイル構造の生成が完了しました:', outputPath);
  } catch (error) {
    console.error('ファイル構造の生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトの実行
generateFileStructure(); 