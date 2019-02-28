<template>
  <div class="buttons">
    <div class="button close">
      <a class="button-text closebutton" href="#">
        <svg width="6px" height="6px" viewBox="0 0 155 155" version="1.1">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g transform="translate(-159.000000, -205.000000)" fill="#540202">
              <path
                d="M236.790211,264.82233 L296.187181,205.425361 L313.86485,223.10303 L254.467881,282.5 L313.86485,341.89697 L296.187181,359.574639 L236.790211,300.17767 L177.393241,359.574639 L159.715572,341.89697 L219.112541,282.5 L159.715572,223.10303 L177.393241,205.425361 L236.790211,264.82233 Z"
              ></path>
            </g>
          </g>
        </svg>
      </a>
      <!-- close button link -->
    </div>
    <div class="button minimize">
      <a class="button-text minimizebutton" href="#">
        <svg
          width="9px"
          height="9px"
          viewBox="0 0 188 25"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Desktop" transform="translate(-632.000000, -270.000000)" fill="#995700">
              <rect id="Rectangle" x="632.17544" y="270" width="187" height="25"></rect>
            </g>
          </g>
        </svg>
      </a>
      <!-- minimize button link -->
    </div>
    <div class="button zoom">
      <a class="button-text zoombutton" href="#">
        <img src="../assets/osx_zoom.svg">
      </a>
      <!-- zoom button link -->
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style scoped lang="scss">
.buttons {
  display: flex;
  width: 73px;
  min-width: 73px;
  justify-content: center;
  padding-top: 10px;
}

.buttons:hover a {
  visibility: visible;
}

.button {
  margin: 0 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.button-text {
  text-decoration: none;
  font-weight: normal;
  padding: 0 1px;

  font-size: 14px;
  position: absolute;
  margin-top: -1px;
  &.closebutton {
    margin-top: -3px;
    margin-left: 2px;
  }
  &.minimizebutton {
    margin-left: 0.5px;
    margin-top: -0.5px;
  }
  &.zoombutton {
    margin-top: -1px;
    img {
      width: 6px;
      height: 6px;
      margin-left: 2px;
      margin-top: 4px;
      position: absolute;
    }
  }
}

.close {
  background: #ff5c5c;
  font-size: 9pt;

  /* border: 1px solid #e33e41; */
}

.close:active {
  background: #c14645;
}

.close:active .closebutton {
  color: #4e0002;
}

.closebutton {
  color: #820005;
  visibility: hidden;
  cursor: default;
}

.minimize {
  background: #ffbd4c;
  font-size: 9pt;
  line-height: 11px;

  /* border: 1px solid #e09e3e; */
}

.minimize:active {
  background: #c08e38;
}

.minimize:active .minimizebutton {
  color: #5a2607;
}

.minimizebutton {
  color: #9a5518;
  visibility: hidden;
  cursor: default;
}

.zoom {
  background: #00ca56;
  font-size: 9pt;
  line-height: 11px;

  /* border: 1px solid #14ae46; */
}

.zoom:active {
  background: #029740;
}

.zoom:active .zoombutton {
  color: #003107;
}

.zoombutton {
  color: #006519;
  visibility: hidden;
  cursor: default;
}
</style>
