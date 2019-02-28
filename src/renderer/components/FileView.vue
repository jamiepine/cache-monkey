<template>
  <div v-if="viewing" class="file-view">
    <div class="image-view" v-if="viewing.type == 'mp4'">
      <div class="video-big">
        <video class="player" height="100px" playsinline loop controls>
            <source :src="`${dumpDirectory}/${viewing.dumpKey}`" type="video/mp4" />
        </video>
      </div>
    </div>
    <div class="image-view" v-else>
      <div
        class="image-big"
        :style="{ 'background-image': `url(file://${dumpDirectory}/${viewing.dumpKey})` }"
      />
    </div>
    <div class="info-area">
      <div style="opacity:0.3;">Size</div>
      <div>{{bytesToSize(viewing.size)}}</div>
      <br>
      <div style="opacity:0.3;">Created</div>
      <div>{{viewing.created.toLocaleString()}}</div>
      <div>({{niceTime(viewing.created)}})</div>
      <br>
      <div style="opacity:0.3;">Origin Location</div>
      <div>{{viewing.originLocation}}</div>
      <br>
      <button class="coolbtn margin-vertical">Open</button>
      <br>
      <div style="opacity:0.3;">Dump Location</div>
      <div>{{dumpDirectory + '/' + viewing.dumpKey}}</div>
      <button class="coolbtn margin-vertical">Open</button>
      <br>
      <div style="opacity:0.3;">( ͡° ͜ʖ ͡°)</div>
      <button
        @click="save(viewing)"
        class="coolbtn margin-vertical"
      >{{saved ? 'Done!' :'Save To Pictures'}}</button>
      <br>
    </div>
  </div>
</template>

<script>
import * as moment from "moment";

moment.updateLocale("en", {
  relativeTime: {
    future: "now",
    past: "%s",
    s: "1 second ago",
    m: "1 minute ago",
    mm: "%d minutes ago",
    h: "1 hour ago",
    hh: "%d hours ago",
    d: "1 day ago",
    dd: "%d days ago",
    M: "1 month ago",
    MM: "%d months ago",
    y: "1 year ago",
    yy: "%d years ago"
  }
});
import { promisify } from "util";
const fs = require("fs");
const copyFile = promisify(fs.copyFile);
export default {
  data() {
    return {
      saved: false
    };
  },
  computed: {
    viewing() {
      return this.$store.state.viewingItem;
    },
    dumpDirectory() {
      return this.$store.state.dumpDirectory;
    },
    picsDir: {
      get() {
        return this.$store.state.picsDir;
      },
      set(value) {
        this.$store.state.picsDir = value;
      }
    }
  },
  methods: {
    async save(file) {
      console.log(
        this.dumpDirectory + "/" + file.dumpKey,
        this.picsDir + "/" + file.dumpKey
      );
      await copyFile(
        this.dumpDirectory + "/" + file.dumpKey,
        this.picsDir + "/" + file.dumpKey
      );
      this.saved = true;
    },
    bytesToSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "0 Byte";
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
    },
    niceTime(time) {
      return moment(time).fromNow(false);
    }
  }
};
</script>

<style lang="scss">
.file-view {
  display: flex;
  flex-direction: row;
}
.video-big {
  left: 0;
  right: 0;
  margin: auto;
  min-height: 200px;
  margin-top: 100px;
  float: left;
}
.image-big {
  height: 70vh;
  width: 500px;
  background-size: contain;
  background-position: center;
  background-color: black;
  background-repeat: no-repeat;
}
.info-area {
  margin: 20px;
  display: flex;
  flex-direction: column;
  max-width: 260px;
  overflow: hidden;
}
</style>
