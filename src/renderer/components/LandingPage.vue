<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div class="heading-area">
      <div  @click.prevent="open('https://jamiepine.com/cachemonkey')" 
      v-tippy="$store.state.tooltipBottom"
        title="If this doesn't turn green after a few minutes, click here to download update and reinstall. Your dump and settings won't be lost, don't worry!"
      v-if="updateDownloading && !updateReady" class="update-box grey">New update available!
        <br>
        <small>Updating in background...</small>
      </div>
      <div @click="reload" v-else-if="updateReady" class="update-box">New update downloaded!
        <br>
        <small>Click here to reload.</small>
      </div>

      <!-- <h1 style="text-align:center">{{monkey}}</h1> -->
      <div style="text-align: center;width:100%;margin-bottom:10px;">
        <img v-if="monkey === 1" width="70px" src="../assets/monkey.svg">
        <img v-else-if="monkey === 2" width="70px" src="../assets/monkey_cover_ears.svg">
        <img v-else-if="monkey === 3" width="70px" src="../assets/monkey_cover_mouth.svg">
        <img v-else-if="monkey === 4" width="70px" src="../assets/monkey_cover_eyes.svg">
      </div>
      <a
        style="text-align: center;"
        href="#"
        @click.prevent="open('https://twitter.com/jamiepine')"
      >
        <h1 class="main-title logo">CacheMonkey</h1>
        <small style="opacity: 0.2;">
          by
          <b>Jamie Pine</b>
        </small>
      </a>
      <br>

      <div class="info-bar">
        <Input
          class="transparent_input"
          :editable="false"
          :value="currentTask"
          @update="(value) => text = value"
          :big="false"
        />
        <div
          :style="{'width': (((totalAnalysed / totalAnalysing) * 100) * 240 ) / 100  + 'px'}"
          class="progress-bar"
          v-if="processing"
        />
      </div>
      <!-- <button @click="$store.dispatch('toggleDark')">Toggle theme</button> -->
      <button v-if="!processing" class="coolbtn margin-vertical" @click="$parent.scanAll">Scan Cache</button>
      <button v-else class="coolbtn margin-vertical" @click="processing = false">Abort Tasks</button>
      <!-- <button
        v-if="!$parent.watcherRunning"
        class="coolbtn margin-vertical"
        @click="initWatch "
      >Watch For Updates</button>
      <button v-else class="coolbtn margin-vertical" @click="killWatch">Kill Watcher</button>-->
      <br>

      <div v-if="foundFiletypes.length > 0" style="opacity:0.3;">Filetypes Discovered</div>
      <div style="width:230px;" class="flex">
        <div
          class="coolbtn margin-right"
          style="padding: 10px; max-width: 260px;margin-bottom:7px;"
          v-for="(i, index) of foundFiletypes"
          :key="index"
          :class="{'filtered': currentFilter === i}"
          @click="filterItems(i)"
        >{{i ? i : 'uh?'}}</div>
      </div>
      <br>
      <div v-if="foundFiletypes.length > 0" style="opacity:0.3;">View</div>
      <br>
      <div style="opacity:0.3; font-size: 14px;">Tile Size: </div>
      <input style="width: 240px;" min="80" max="215" value="100" class="coolslider" @change="changeTileSize" type="range">
      <br>

      <!-- <div style="opacity:0.3;">Total Analysed:</div>
      <b>{{totalAnalysed}}/{{totalAnalysing}}</b>
      <div style="opacity:0.3;">dumpScanComplete:</div>
      <b>{{dumpScanComplete}}</b>
      <div style="opacity:0.3;">dirScanComplete</div>
      <b>{{dirScanComplete}}</b>
      <br>-->
      <br>
      <div v-if="foundFiletypes.length > 0" style="opacity:0.3;">Options</div>
      <button
        v-tippy="$store.state.tooltipSidebar"
        title="This will permanently delete all files in the CacheMonkey dump directory. There is no confirm screen, this button is wild."
        class="coolbtn margin-vertical"
        @click="$parent.purgeDump"
        @mouseover="monkey = 3"
        @mouseout="monkey = 1"
      >Purge Dump</button>
      <button
        v-tippy="$store.state.tooltipSidebar"
        title="This will wipe the cache directory for every application you have added to CacheMonkey via the settings tab."
        class="coolbtn margin-vertical warning"
        @click="$parent.purgeCache"
        @mouseover="monkey = 2"
        @mouseout="monkey = 1"
      >Purge Cache</button>
      <button
        v-tippy="$store.state.tooltipSidebar"
        title="A big red button."
        class="coolbtn margin-vertical danger"
        @mouseover="monkey = 4"
        @mouseout="monkey = 1"
        @click="$parent.purgeBoth"
      >Purge Cache & Dump</button>
      <br>
      <div></div>
    </div>
    <div class="content">
      <div
        v-for="(i, index) of content"
        :key="index"
        class="image"
        @click='click(i, `url("file://${dumpDirectory.replace(/[ ]/g, "\\ ")}/${i.dumpKey.replace(/[ ]/g, "\ ")}")`, index);'
        :style='{ "background-image": `url("file://${dumpDirectory.replace(/[ ]/g, "\\ ")}/${i.dumpKey.replace(/[ ]/g, "\ ")}")` }'
      >
        <div class="hover-info">
          <div class="blob" v-if="i.type">{{i.type}}</div>
          <!-- <div class="blob blob2" v-if="i.size">{{bytesToSize(i.size) }}</div> -->
          <!-- {{bytesToSize(i.size)}} -->
        </div>
      </div>
    </div>
    <!-- <div class="image" :style="{ 'background-image': `url(${test})` }"></div>
    {{test}}-->
    <br>
    <div class="mainblob blob">
      <b>{{content.length}}</b> Items
    </div>
  </div>
</template>

<script>
import drivelist from "drivelist";
import { promisify } from "util";
const { shell } = require("electron");
const remote = require("electron").remote;
const dialog = remote.dialog;
const Path = require("path");
const fs = require("fs");
const readChunk = require("read-chunk");
const fileType = require("file-type");
const os = require("os");
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
const chokidar = require("chokidar");

import Input from "./Input";
import { mapState } from "vuex";

export default {
  name: "landing-page",
  components: {
    Input
  },
  data() {
    return {
      monkey: 1,
      currentFilter: false,
      updateDownloading: false,
      updateFailed: false
    };
  },
  mounted() {
    setTimeout(
      () => (this.updateDownloading = remote.app.updateDownloading),
      2000
    );
    const interval = setInterval(() => {
      if (remote.app.updateDownloading) {
        this.updateDownloading = remote.app.updateDownloading;
      }
      if (remote.app.updateDownloaded) {
        this.updateReady = remote.app.updateDownloaded;
        clearInterval(interval);
      }
      if (remote.app.updateFailed) {
        this.updateReady = remote.app.updateFailed;
        this.updateFailed = remote.app.updateFailed;
        this.$root.$emit(
          "alert",
          "error",
          "Unable to install update automatically, you can download it manually by clicking here",
          "https://jamiepine.com/cachemonkey"
        );

        clearInterval(interval);
      }
    }, 30000);

    this.$root.$on('nextItem', () => this.nextItem())
    this.$root.$on('previousItem', () => this.previousItem())
  },
  methods: {
    open(link) {
      shell.openExternal(link);
    },
    nextItem() {
      let newIndex = this.viewing.index + 1
      let obj = this.content[newIndex]
      obj.index = newIndex
      this.viewing = Object.assign(obj)
    },
    previousItem() {
      let newIndex = this.viewing.index - 1
      let obj = this.content[newIndex]
      obj.index = newIndex
      this.viewing = Object.assign(obj)
    },
    initWatch() {
      this.$parent.watchBlocker = false;
      this.$parent.initWatchers();
    },
    killWatch() {
      this.$parent.watchBlocker = true;
      this.$parent.watcherRunning = false;
    },
    reload() {
      this.fileIndex = {};
      localStorage.clear();
      remote.app.reloadApp();
    },
    changeTileSize(event) {
      let newSize = Number(event.target.value)

      // images snapping to side
      let contentWidth = document.getElementsByClassName('content')[0].offsetWidth
      let tilesPastEachother = Math.floor(contentWidth / newSize+2)
      let emptySpace = contentWidth % newSize+2
      let change = emptySpace / tilesPastEachother
      newSize += change-2.3

      // change width and height of images
      let tiles = document.getElementsByClassName('image')
      for(let i = 0; i < tiles.length; i++) {
        tiles[i].style.width = newSize+'px'
        tiles[i].style.height = newSize+'px'
      }
    },
    click(item, fileDir, index) {
      console.log(item, fileDir);
      let obj = item;
      item.index = index
      this.viewing = item;
      this.$root.$emit("modal", "FileView");
    },
    open(link) {
      this.$electron.shell.openExternal(link);
    },
    bytesToSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "0 Byte";
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    },
    filterItems(type) {
      if (this.currentFilter == type) return (this.currentFilter = "");
      this.currentFilter = type;
    },
    open(link) {
      shell.openExternal(link);
    }
  },
  computed: {
    content() {
      const everything = Object.keys(this.fileIndex).map(
        item => this.fileIndex[item]
      );
      const filter = everything.filter(item => {
        if (this.currentFilter) {
          return (
            item.type &&
            // item.type != "unknown" &&
            (this.currentFilter && item.type == this.currentFilter)
          );
        } else {
          return item.type && item.type != "unknown" && item.type != "gzip";
        }
      });
      return filter.reverse();
    },
    contentLength() {
      return Object.keys(this.fileIndex).map(item => this.fileIndex[item])
        .length;
    },
    autoStart() {
      return this.$store.state.autoStart;
    },
    viewing: {
      get() {
        return this.$store.state.viewingItem;
      },
      set(value) {
        this.$store.state.viewingItem = value;
      }
    },
    processing: {
      get() {
        return this.$store.state.processing;
      },
      set(value) {
        this.$store.state.processing = value;
      }
    },
    updateReady: {
      get() {
        return this.$store.state.updateReady;
      },
      set(value) {
        this.$store.state.updateReady = value;
      }
    },
    fileIndex: {
      get() {
        return this.$store.state.fileIndex;
      },
      set(value) {
        this.$store.state.fileIndex = value;
      }
    },
    dumpDirectory: {
      get() {
        return this.$store.state.dumpDirectory;
      },
      set(value) {
        this.$store.state.dumpDirectory = value;
      }
    },
    watchDirectories: {
      get() {
        return this.$store.state.watchDirectories;
      },
      set(value) {
        this.$store.state.watchDirectories = value;
      }
    },
    foundFiletypes: {
      get() {
        return this.$store.state.foundFiletypes;
      },
      set(value) {
        this.$store.state.foundFiletypes = value;
      }
    },
    currentTask: {
      get() {
        return this.$store.state.currentTask;
      },
      set(value) {
        this.$store.state.currentTask = value;
      }
    },
    totalAnalysing: {
      get() {
        return this.$store.state.totalAnalysing;
      },
      set(value) {
        this.$store.state.totalAnalysing = value;
      }
    },
    totalAnalysed: {
      get() {
        return this.$store.state.totalAnalysed;
      },
      set(value) {
        this.$store.state.totalAnalysed = value;
      }
    },
    dumpScanComplete: {
      get() {
        return this.$store.state.dumpScanComplete;
      },
      set(value) {
        this.$store.state.dumpScanComplete = value;
      }
    },
    dirScanComplete: {
      get() {
        return this.$store.state.dirScanComplete;
      },
      set(value) {
        this.$store.state.dirScanComplete = value;
      }
    },
    watchBlocker: {
      get() {
        return this.$store.state.watchBlocker;
      },
      set(value) {
        this.$store.state.watchBlocker = value;
      }
    }
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}
.image {
  width: 100px;
  height: 100px;
  margin: 1px;
  background: var(--background);
  float: left;
  background-size: cover;
  cursor: pointer;
  position: relative;
  /* transition: 100ms; */
}
.image:hover {
  opacity: 0.7;
  .blob2 {
    display: block;
  }
}
.blob {
  padding: 5px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.4);
  font-size: 9px;
  font-weight: bold;
  position: absolute;
  margin: 4px;
  color: #fff;
}
.update-box {
  font-size: 13px;
  border-radius: 5px;
  padding: 10px;
  background: #43b153;
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
  cursor: pointer;
  transition: 100ms;
  &:hover {
    background: #318a3e;
  }
  &.grey {
    background: var(--boxLight);
  }
}
.blob2 {
  display: none;
  top: 20px;
}
.main-title {
  cursor: default;
}
.flex {
  display: flex;
  width: 280px;
  flex-wrap: wrap;
  margin-top: 10px;
  .coolbtn {
    margin-bottom: 5px;
    &.filtered {
      background: #1bb9dc;
    }
  }
}
#wrapper {
  /* background: radial-gradient(
    ellipse at top left,
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
  ); */
  height: 100vh;
  padding: 1px;
  width: 100vw;
  display: flex;
  flex-direction: row;
}
.heading-area {
  padding: 20px;
  position: fixed;
  width: 280px;
  display: flex;
  margin-left: 70px;
  flex-direction: column;
  background: var(--main);
  height: 100vh;
  border-radius: 15px 0 0 0;
  margin-top: 25px;
}
.mainblob {
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  position: fixed;
}
.content {
  margin-left: 360px;
  margin-top: 25px;
}
#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.transparent_input {
  .coolinput {
    background: none !important;
  }
}
.info-bar {
  position: relative;
}
.progress-bar {
  height: 29px;
  background: rgba(97, 97, 97, 0.23);
  border-radius: 5px;
  position: absolute;
  top: 1px;
  margin-left: 1px;
}

.drives {
  display: flex;
  width: 100%;
  height: 150px;
  margin-top: 10px;
  .drive {
    border-radius: 5px;
    background: var(--sidebar);
    height: 150px;
    min-width: 100px;
    margin-right: 10px;
  }
}

.coolslider {
  -webkit-appearance: none;
  margin-top: 5px;
  width: 100%;
  height: 20px;
  background: #202020;
  border-radius: 5px;
  outline: none;
}

.coolslider::-webkit-slider-thumb {
  -webkit-appearance: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  background: #4CAF50;
  cursor: pointer;
}
</style>
