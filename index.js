const factory = require('./lib/eventFactory');
const loading = require('./lib/cliLoading');
const process = require('process');

module.exports = autoGit = ({
    branch = 'dev',
    dirPath = require('path').resolve(__dirname, '.gitFront'),
    distPath = require('path').resolve(__dirname, 'test'),
    gitPath = "git@gitee.com:ycczlyy/nana.git",
} = {}) => {
    const dirTask = factory();
    dirTask.on('start', async function () {
        const debugFile = require('debug')('Auto:File');
        const debugGit = require('debug')('Auto:Git');
        const file = require('fs.io').file;
        const directory = require('fs.io').directory;
        const fsextra = require('fs-extra');
        const git = require('simple-git/promise');

        // // 检查文件夹
        const isHas = await directory.isExists(dirPath);

        if (!isHas) {
            await directory.createDirectory(dirPath);
            debugFile(`git dir  '${dirPath}' create success`);
            loading.start();
            debugGit(`git clone '${gitPath}' start`);
            await git().clone(gitPath, dirPath)
            loading.stop();
            debugGit('git clone success');
        }

        //检查分支
        const excGit = git(dirPath);
        const branchResult = await excGit.branch()
        debugGit(`current branch ${branchResult.current}`); //当前分支
        const isHasTargetBranch = !!branchResult.all.find(item => item === branch);
        const isHasOriginTargetBranch = !!branchResult.all.find(item => item.indexOf(`origin/${branch}`) > -1);
        if (!isHasTargetBranch) {
            loading.start();
            debugGit(`checkout branch ${branchResult.current} to ${branch} start`); //切换分支
            if (isHasOriginTargetBranch) {
                await excGit.checkoutBranch(branch, `origin/${branch}`).catch(e => {
                    debugGit(e)
                    loading.stop();
                })
            } else {
                await excGit.checkoutLocalBranch(branch).catch(e => {
                    debugGit(e)
                    loading.stop();
                })
            }
            loading.stop();
            debugGit(`checkout branch ${branchResult.current} to ${branch} success`); //切换分支
        } else {
            //切换分支
            if (branchResult.current !== branch) {
                await excGit.checkout(branch)
                debugGit(`checkout branch ${branchResult.current} to ${branch} success`); //切换分支
            }
            //拉取代码
            loading.start();
            debugGit(`git pull origin/${branch} start`);
            await excGit.outputHandler((command, stdout, stderr) => {
                stdout.pipe(process.stdout);
                stderr.pipe(process.stderr);
            }).pull();
            loading.stop();
            debugGit(`git pull origin/${branch} success`); //切换分支
        }
        //删除文件
        await Promise.all(require('fs').readdirSync(dirPath).filter(item => item.indexOf('.git') === -1).map(async item => {
            const waitfile = require('path').resolve(dirPath, item);
            debugFile(`remove ${waitfile}`)
            if (!require('fs').statSync(waitfile).isFile()) {
                return directory.delete(waitfile, true);
            } else {
                return file.delete(waitfile);
            }
        }))
        //拷贝文件
        try {
            loading.start();
            const copyResult = await fsextra.copy(distPath, dirPath);
            loading.stop();
            debugFile(`copy ${distPath}/* to ${dirPath}`);
        } catch (e) {
            console.log(e);
            loading.stop();
        }
        // //添加并提交
        loading.start();
        try {
            await excGit
                .outputHandler((command, stdout, stderr) => {
                    stdout.pipe(process.stdout);
                    stderr.pipe(process.stderr);
                })
                .add("--all")
            await excGit
                .outputHandler((command, stdout, stderr) => {
                    stdout.pipe(process.stdout);
                    stderr.pipe(process.stderr);
                })
                .commit(new Date().toString())
            await excGit
                .outputHandler((command, stdout, stderr) => {
                    stdout.pipe(process.stdout);
                    stderr.pipe(process.stderr);
                })
                .push(['-u', 'origin', branch]);

        } catch (e) {
            console.log(e);
        }
        loading.stop();
        debugGit('push is success!!!!!!!!!!!!!');
        this.emit("done");
    })
    return dirTask
}