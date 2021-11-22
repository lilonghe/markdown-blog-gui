<script setup lang="ts">
import { ref } from 'vue';

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
  console.log(fileList);
}

async function selectFile(file) {
  console.log(await file.fileHandle.getFile());
}
</script>

<template>
  <div v-if="fileList.length === 0" class="page-select-path">
    <button class="btn-open-folder" @click="selectPath">Open Directory</button>
  </div>
  <div v-if="fileList.length > 0" class="page-browser">
    <div class="left-panel">
      <ul class="file-list">
        <li v-bind:key="item" v-for="item in fileList.filter(item => item.kind !== 'directory')">
          <!-- <span v-if="item.kind === 'directory'" class="menu-folder">{{item.name}}</span> -->
          <span 
            @click="selectFile(item)"
            v-if="item.kind === 'file'" class="menu-file">{{item.name}}</span>
        </li>
      </ul>
    </div>
    <div class="file-detail"></div>
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
