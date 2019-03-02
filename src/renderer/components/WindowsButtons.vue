

<template>
  <div :class="{'dark-buttons': $store.getters.getThemeName === 'light'}" class="buttons">
    <div @click="minimize" class="button minimize">
      <svg name="TitleBarMinimize" width="12" height="12" viewBox="0 0 12 12">
        <rect fill="#ffffff" width="10" height="1" x="1" y="6"></rect>
      </svg>
      <!-- minimize button link -->
    </div>
    <div @click="maximize" class="button zoom">
      <svg name="TitleBarMaximize" width="12" height="12" viewBox="0 0 12 12">
        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="#ffffff"></rect>
      </svg>
      <!-- zoom button link -->
    </div>
    <div @click="close" class="button close">
      <svg name="TitleBarClose" width="12" height="12" viewBox="0 0 12 12">
        <polygon
          fill="#ffffff"
          fill-rule="evenodd"
          points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
        ></polygon>
      </svg>
      <!-- close button link -->
    </div>
  </div>
</template>

<script>
const { shell, remote } = require("electron");
const win = remote.getCurrentWindow();

export default {
  methods: {
    close() {
      win.close();
    },
    minimize() {
      win.minimize();
    },
    maximize() {
      if (!win.isMaximized()) {
        win.maximize();
      } else {
        win.unmaximize();
      }
    }
  }
};
</script>

<style scoped lang="scss">
.buttons {
  display: flex;
  flex-direction: row;
  /* width: 73px; */
  -webkit-app-region: no-drag;
  min-width: 73px;
  justify-content: center;
  position: absolute;
  right: 0;
  cursor: pointer;
  z-index: 100px;
}
.dark-buttons .button {
  &:hover {
    background: rgb(192, 192, 192);
  }
  &.close:hover {
    background: #e41414dc;
  }

  svg {
    filter: invert(100%);
  }
}
.button {
  padding: 4px 12px;
  cursor: pointer;
  /* width: 33%; */
  &:hover {
    background: var(--boxLight);
  }
  &.close:hover {
    background: #e41414dc;
  }
}
</style>
