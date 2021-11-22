<script setup lang="ts">
import { ref } from 'vue';
import yaml from 'js-yaml';
import dayjs from 'dayjs';

const defintionMetaKeys = ['date', 'lastmod', 'categories', 'tags', 'title', 'url'];

let fileList = ref([]);
const targetFile = ref();

async function getFiles(dirHandle: FileSystemDirectoryHandle) {
  const files = dirHandle.values();
  const list = [];
  for await (let item of files) {
    let obj = {
      kind: item.kind,
      name: item.name,
    }
    if (item.kind === 'directory') {
      obj.children = await getFiles(item);
    } else {
      obj.fileHandle = item;
    }
    list.push(obj);

  }
  return list;
}

async function selectPath() {
  let dirHandle = await window.showDirectoryPicker();
  let files = await getFiles(dirHandle);
  fileList.value = files;
}

interface FileItem {
  meta: Object,
  content: string,
  commonMeta: Object[],
  displayTitle: string,
  fileName: string,
}

const getFileInfo = async (fileHandle: FileSystemFileHandle) => {
  const rawFile = await fileHandle.getFile();
  const fileContent = await rawFile.text();
  let fileInfo: FileItem = {
    fileName: rawFile.name,
  };
  if (fileContent.indexOf('---\n') === 0) {
      let [_, metaStr, content] = fileContent.split('---\n');
      let metaInfo = yaml.load(metaStr)
      fileInfo.meta = metaInfo;
      fileInfo.content = content;

      let commonMeta:Object[] = [];
      Object.keys(metaInfo).filter(key=>!defintionMetaKeys.includes(key)).map(key=>{
          commonMeta.push({
              key,
              value: metaInfo[key].toString(),
          });
      })
      fileInfo.commonMeta = commonMeta;

      if (!fileInfo.meta.url) {
          fileInfo.meta.url = fileInfo.fileName.substr(0, fileInfo.fileName.lastIndexOf('.md'));
      }

      fileInfo.displayTitle = fileInfo.meta.title || fileInfo.meta.url;
  }
  return fileInfo;
}

const formatDate = (value: string, fmt='YYYY-MM-DD hh:mm:ss') => {
    if (value) {
        return dayjs(String(value)).format(fmt)
    }
    return value
}

async function selectFile(file) {
  const fileInfo = await getFileInfo(file.fileHandle);
  targetFile.value = fileInfo;
  console.log(fileInfo);
}
</script>

<template>
  <div v-if="fileList.length === 0" class="page-select-path">
    <button class="btn-open-folder" @click="selectPath">Open Directory</button>
  </div>
  <div v-if="fileList.length > 0" class="page-browser">
    <div class="left-panel">
      <ul class="file-list">
        <li 
          v-bind:key="item" 
          v-for="item in fileList.filter(item => item.kind !== 'directory')"
          :class="{active: targetFile?.fileName === item.name}"
          @click="selectFile(item)">
          <!-- <span v-if="item.kind === 'directory'" class="menu-folder">{{item.name}}</span> -->
          <span  v-if="item.kind === 'file'" class="menu-file">{{item.name}}</span>
        </li>
      </ul>
    </div>
    <div class="file-detail" v-if="targetFile">
        <h1 class="file-title">{{targetFile.displayTitle}} <small v-if="targetFile.meta.url != targetFile.displayTitle">{{targetFile.meta.url}}</small></h1>
        <div class="file-meta">
          <small>{{formatDate(targetFile.meta.date)}}</small>
          <small v-if="targetFile.meta.lastmod"> / {{formatDate(targetFile.meta.lastmod)}}</small>
          <div class="file-common-meta">
            <p v-for="item in targetFile.commonMeta">{{item.key}}: {{item.value}}</p>
          </div>
        </div>
        <ul class="file-categories" v-if="targetFile.meta.categories">
          <li v-for="cate in targetFile.meta.categories">{{cate}}</li>
        </ul>
        <ul class="file-tags" v-if="targetFile.meta.tags">
          <li v-for="tag in targetFile.meta.tags">#{{tag}}</li>
        </ul>
        <div class="file-content"><pre>{{targetFile.content}}</pre></div>
      </div>
      <div class="no-file-selected" v-if="!targetFile">
        No file selected.
      </div>
  </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
html, body, #app {
    height: 100%;
}

:root {
    --primary-color: sandybrown;
}

.page-select-path {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-open-folder {
  display: inline-block;
  padding: 15px 40px;
  background-color: var(--primary-color);
  color: #FFF;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.page-browser {
   display: flex;
}

.file-list {
    border-right: 1px solid var(--primary-color);
    overflow: auto;
    flex: 1;
}

.file-list li{
    list-style: none;
    border-bottom: 1px solid var(--primary-color);
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
    color: var(--primary-color);
    transition: all .3s;
    font-size: 14px;
    position: relative;
}

.file-list li span:first-child {
    max-width: 180px;
    overflow: hidden;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-list li:hover, .file-list li.active {
    background-color: var(--primary-color);
    color: #FFF;
}

.file-list li:hover .triangle, .file-list li.active .triangle {
    border-right-color: #FFF;
}

.file-detail {
    flex: 1;
    padding: 10px 20px;
    height: 100vh;
    overflow: auto;
}

.file-detail .file-title {
    height: 40px;
    line-height: 40px;
}

.file-detail .file-title small {
    font-size: 14px;
    color: #AAA;
    vertical-align: baseline;
}

.file-detail .file-meta {
    color: #AAA;
}

.file-detail .file-categories, .file-detail .file-tags {
    margin-top: 10px;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: #666;
}

.file-detail .file-tags li,  .file-detail .file-categories li{
    border: 1px solid var(--primary-color);
    padding: 4px 6px;
    color: var(--primary-color);
    border-radius: 3px;
}

.file-detail .file-content {
    margin-top: 20px;
}

.file-common-meta {
    margin-top: 10px;
    font-size: 12px;
}

.left-panel {
    height: 100vh;
    display: flex;
    flex-direction: column;
    width: 240px;
}
</style>
