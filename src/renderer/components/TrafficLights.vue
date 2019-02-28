<template>
  <div class="buttons">
    <div class="button close">
      <a class="button-text closebutton" href="#">&#215;</a>
      <!-- close button link -->
    </div>
    <div class="button minimize">
      <a class="button-text minimizebutton" href="#">&ndash;</a>
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
    margin-top: -2px;
    margin-left: 0.5px;
  }
  &.minimizebutton {
    margin-left: 1.5px;
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
