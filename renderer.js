const { ipcRenderer } = require('electron')
const yaml = require('js-yaml');
const fs   = require('fs');
const path = require('path');
const { readdir, readFile } = require('fs/promises');
const dayjs = require('dayjs');
const Vue = require('vue');

const defintionMetaKeys = ['date', 'lastmod', 'categories', 'tags', 'title', 'url'];

window.addEventListener('load', async () => {
    const app = Vue.createApp(AppInstance)
    app.config.globalProperties.$filters = {
        formatDate(value, fmt='YYYY-MM-DD hh:mm:ss') {
            if (value) {
                return dayjs(String(value)).format(fmt)
            }
            return value
        }
    }
    app.mount('#container');
});

const AppInstance = {
    data() {
        return {
            rootDir: undefined,
            fileList: [],
            targetFile: undefined,
            inited: false,
        }
    },
    async mounted() {
        const rootDir = await ipcRenderer.invoke('getStoreValue', 'rootDir');
        if (rootDir) {
            this.rootDir = rootDir;
            await this.readDir(rootDir);
            
        }
        ipcRenderer.on("set-root-dir",(event,args)=>{
            this.rootDir = args;
            this.readDir(args);
        });
        this.inited = true;
    },
    methods: {
        chooseRootDir() {
            ipcRenderer.send('chooseRootDir');
        },
        async readDir(rootDir) {
            let list = [];
            try {
                const files = await readdir(rootDir);
                if(!files.length) {
                    alert('Nil Directory');
                }

                for await (const fileName of files) {
                    const filePath = path.join(rootDir, fileName);
                    const stat = fs.statSync(filePath);
                    let fileInfo = { fileName, filePath };
                    if (stat.isFile()) {
                        if (path.extname(fileName).toLowerCase() === '.md') {
                            fileInfo.size = stat.size;

                            const fileContent = await readFile(fileInfo.filePath, { encoding: 'utf8' });
                            if (fileContent.indexOf('---\n') === 0) {
                                let [_, metaStr, content] = fileContent.split('---\n');
                                let metaInfo = yaml.load(metaStr)
                                fileInfo.meta = metaInfo;
                                fileInfo.content = content;

                                let commonMeta = [];
                                Object.keys(metaInfo).filter(key=>!defintionMetaKeys.includes(key)).map(key=>{
                                    commonMeta.push({
                                        key,
                                        value: metaInfo[key].toString(),
                                    });
                                })
                                fileInfo.commonMeta = commonMeta;

                                if (!fileInfo.meta.url) {
                                    fileInfo.meta.url = path.basename(fileInfo.fileName, '.md');
                                }

                                fileInfo.displayTitle = fileInfo.meta.title || fileInfo.meta.url;

                                list.push(fileInfo)
                            }
                        }
                    } else {
                        // 下个版本再放出来
                        // fileInfo.isDir = true;
                        // fileInfo.meta = {
                        //     date: new Date(),
                        // }
                    }
                }
                list = list.sort((a,b) => b.meta.date - a.meta.date);
                this.fileList = list;
            } catch (err) {
                console.error(err);
            }
        },
        selectFile(file) {
            this.targetFile = file;
        }
    }
}
