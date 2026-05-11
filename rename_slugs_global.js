import fs from 'fs'
import path from 'path'

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      if (
        f !== 'node_modules' &&
        f !== '.next' &&
        f !== 'out' &&
        f !== 'build'
      ) {
        walkDir(dirPath, callback)
      }
    } else {
      if (
        dirPath.endsWith('.js') ||
        dirPath.endsWith('.jsx') ||
        dirPath.endsWith('.ts') ||
        dirPath.endsWith('.tsx')
      ) {
        callback(dirPath)
      }
    }
  })
}

walkDir('/Users/sdsys/Files/merouni.com/frontend/src', (fullPath) => {
  let content = fs.readFileSync(fullPath, 'utf8')
  const original = content

  // Replace all whole word occurrences of slugs with slug
  content = content.replace(/\bslugs\b/g, 'slug')

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`Updated ${fullPath}`)
  }
})
