<template>
  <div id="wrapper">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <div class="heading-area">
      <a
        style="text-align: center;"
        href="#"
        @click.prevent="open('https://twitter.com/jamiepine')"
      >
        <h1 style="text-align:center">{{monkey}}</h1>
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
        />
      </div>
      <!-- <button @click="$store.dispatch('toggleDark')">Toggle theme</button> -->
      <button
        v-if="!processing"
        @mouseover="monkey = '🙉'"
        @mouseout="monkey = defaultMonkey"
        class="coolbtn margin-vertical"
        @click="$parent.scanAll"
      >Scan Cache</button>
      <button v-else class="coolbtn margin-vertical" @click="processing = false">Abort Tasks</button>
      <br>

      <div v-if="foundFiletypes.length > 0" style="opacity:0.3;">Filetypes Discovered</div>
      <div class="flex">
        <div
          class="coolbtn margin-right"
          v-for="(i, index) of foundFiletypes"
          :key="index"
          :class="{'filtered': currentFilter === i}"
          @click="filterItems(i)"
        >{{i ? i : 'uh?'}}</div>
      </div>

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
      >Purge Dump</button>
      <button
        v-tippy="$store.state.tooltipSidebar"
        title="This will wipe the cache directory for every application you have added to CacheMonkey via the settings tab."
        class="coolbtn margin-vertical warning"
        @click="$parent.purgeCache"
      >Purge Cache</button>
      <button
        v-tippy="$store.state.tooltipSidebar"
        title="A big red button."
        class="coolbtn margin-vertical danger"
        @mouseover="monkey = '🙊'"
        @mouseout="monkey = defaultMonkey"
        @click="$parent.purgeBoth"
      >Purge Cache & Dump</button>
      <br>
      <div style="opacity:0.3;">Content Loaded:</div>
      <b>{{content.length}}</b>
    </div>
    <div class="content">
      <div
        v-for="(i, index) of content"
        :key="index"
        class="image"
        @click="click(i)"
        :style="{ 'background-image': `url(file://${dumpDirectory}/${i.dumpKey})` }"
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
  </div>
</template>

<script>
import drivelist from "drivelist";
import { promisify } from "util";
const { shell } = require("electron");
const { dialog } = require("electron").remote;
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
      defaultMonkey: "🙈",
      monkey: "🙈",
      currentFilter: false
    };
  },
  watch: {},
  methods: {
    click(item) {
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
  background: #303030;
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
  background: var(--background2);
  height: 100vh;
  border-radius: 15px 0 0 0;
  margin-top: 25px;
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
</style>
