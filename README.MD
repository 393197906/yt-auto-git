#autoGit
A tool for front-end automatic deployment of code to git's repository
##api
```javascript
autoGit(
   branch = 'dev', // branch
   dirPath = require('path').resolve(__dirname, '.gitFront'), // copyPath
   distPath = require('path').resolve(__dirname, 'test'), // sourcePath
   gitPath = "git@gitee.com:ycczlyy/nana.git",  // gitpath
)
    
```
 
