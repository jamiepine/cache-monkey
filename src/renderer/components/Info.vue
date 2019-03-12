<template>
  <div class="page">
    <h2>About CacheMonkey</h2>
    <small>...and some helpful info</small>
    <br>
    <div class="support">
      <h4>❤️ Support me</h4>
      <p>
        If you enjoy this app, the best way to support it is by jumping into one of my streams on Twitch. I stream daily at
        <a
          href="#"
          @click.prevent="open('https://twitch.tv/jamiepinelive')"
        >twitch.tv/jamiepinelive</a>. If you want to contact me about a problem with this app, drop a tweet to
        <a
          href="#"
          @click.prevent="open('https://twitter.com/jamiepine')"
        >@jamiepine</a> on Twitter. If you want to
        <a
          href="#"
          @click.prevent="open('https://streamlabs.com/jamiepine')"
        >donate</a> you can, it helps me make more apps like this.
      </p>
    </div>
    <!-- <icon :icon="['fab', 'twitter']"/> -->
    <h4>🤔 What is a cache?</h4>
    <p>Caching is common practice by apps to help decreace server bandwidth costs and improve loadtimes. If an app can save media to your device, it need not request it from the server again. These apps usually store the files without any metadata or even filetype. CacheMonkey takes care of discovering the original filetype and processing the cache files for preview.</p>
    <h4>🌚 What stuff gets cached?</h4>
    <p>Most apps will store all media that is loaded from their servers. For example, entering Discord channel will load not only the images you see with your eyes, but approximatly 6 times your screen height, even if you don't scroll up. Images that are deleted immediately after posting are still saved in your cache if they loaded to your client- which could remain there for months. In Electron's case it is limited by size.</p>
    <h4>🔑 What apps does CacheMonkey support?</h4>
    <p>In theory, anything with a "Cache" folder, if you can locate it, we should be able to convert it to the original filetype and allow you to view it with this app.</p>
    <h4>🛠 Developers, you can help!</h4>
    <p>
      The source code for this app is available on
      <a
        href="#"
        @click.prevent="open('https://github.com/jamiepine/cache-monkey')"
      >GitHub</a>, I made it in just two days so it could use a clean-up. It's built with NodeJS, VueJS and Electron (I've disabled caching, don't worry about possible cache-ception). Massive thanks to
      <a
        href="#"
        @click.prevent="open('https://twitter.com/TheTetrabyte')"
      >Tetrabyte</a> for working with me to get this app released so quickly.
    </p>
    <h4>👀 Watch me build it!</h4>
    <p>
      I built this app in a YouTube video, watch it
      <a
        href="#"
        @click.prevent="open('https://www.youtube.com/playlist?list=PLElqxO5aTpgxJWkOAIc26E4D7FhIdBT2D')"
      >here.</a>
    </p>
  </div>
</template>

<script>
const { shell } = require("electron");

export default {
  methods: {
    open(link) {
      shell.openExternal(link);
    }
  }
};
</script>

<style scoped>
a {
  color: #14ffff;
}
.support {
  background: var(--box);
  padding: 5px 30px 1px 30px;
  border-radius: 10px;
  margin-bottom: 20px;
}
</style>
