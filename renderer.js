const { ipcRenderer, dialog, remote } = require('electron')

window.addEventListener('load', async () => {
    const app = Vue.createApp(AppInstance).mount('#container');
});

const AppInstance = {
    data() {
        return {
            rootDir: undefined,
            fileList: [],
        }
    },
    async mounted() {
        const rootDir = await ipcRenderer.invoke('getStoreValue', 'rootDir');
        if (rootDir) {
            this.rootDir = rootDir;
            this.readDir(rootDir);
        }
    },
    methods: {
        chooseRootDie() {
            ipcRenderer.send('chooseRootDir');
        },
        async readDir(rootDir) {
            const fs = require('fs');
            const { readdir } = require('fs/promises');
            const path = require('path');
            let list = [];
            try {
                const files = await readdir(rootDir);
                for await (const fileName of files) {
                    const filePath = path.join(rootDir, fileName);
                    const stat = fs.statSync(filePath);
                    let fileInfo = { fileName, filePath };
                    console.log(stat);
                    if (stat.isFile()) {
                        if (path.extname(fileName).toLowerCase() === '.md') {
                            fileInfo.size = stat.size;
                        }
                    } else {
                        fileInfo.isDir = true;
                    }
                    list.push(fileInfo)
                }
                this.fileList = list;
            } catch (err) {
                console.error(err);
            }
        }
    }
}
