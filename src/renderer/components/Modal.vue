<template>
  <!-- <transition name="fade"> -->
  <div v-shortkey="['esc']" @shortkey="close()">
    <transition name="fade">
      <div v-if="show" class="backdrop" @click="backdropPress"/>
    </transition>
    <transition name="slideup">
      <div v-if="show" class="modal_container" :class="`${modalContent}`">
        <component :is="modalContent" :data="data"/>
      </div>
    </transition>
  </div>
</template>


<script>
import FileView from "./FileView";

export default {
  name: "Modal",
  components: {
    FileView
  },
  data() {
    return {
      modalContent: "",
      id: " ",
      modalStack: [],
      data: false
    };
  },
  created() {
    this.$root.$on("modal", (modalContent, data) => {
      this.data = data;
      this.open(modalContent);
    });
    this.$root.$on("closeModal", () => {
      this.close();
    });
  },
  methods: {
    open(modalContent) {
      this.modalContent = modalContent;
      this.show = true;
    },
    backdropPress() {
      this.close();
    },
    close() {
      this.show = false;
      document.body.classList.remove("bigEditNewPost");
    }
  },
  computed: {
    show: {
      get() {
        return this.$store.state.showModel;
      },
      set(value) {
        this.$store.state.showModel = value;
      }
    }
    // ...mapState({
    //   unsavedChanges: state => state.unsavedChangesOnModal
    // })
  }
};
</script>

<style lang="scss" scoped>
.modal_container {
  &.Settings,
  &.modal_container.CreatorsDashboard {
    width: 90%;
    max-width: 1100px;
    margin-top: 70px;
    height: 83vh;
  }
}

.modal_container.Settings .modal_content {
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

.backdrop {
  position: fixed;
  width: 100%;
  height: 100vh;
  background: #000;
  opacity: 0.95;
  z-index: 9090;
  transition: 1s;
}

.modal_container {
  left: 0;
  right: 0;
  margin: auto;
  width: 80vw;
  min-height: 200px;
  height: 70vh;
  margin-top: 100px;
  box-shadow: 0px 2px 120px 0px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  background: var(--background);
  position: fixed;
  z-index: 9091;
  overflow: hidden;
  opacity: 1;
}

.save_changed_popup {
  position: absolute;
  top: calc(100vh - 54px);
  z-index: 9999999;
  width: 90%;
  max-width: 1100px;
  margin: auto;
  left: 0;
  right: 0;
  display: flex;
  -ms-flex-line-pack: end;
  align-content: flex-end;
}

.modal_content {
  padding: 20px;
}
.modal_content.full_length {
  height: calc(100vh - 200px);
  overflow: scroll;
}

.modal-header {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid #f5f5f5;
}

.modal-header .title {
  color: #9e9e9e;
  font-size: 13px;
  margin-left: 10px;
}

.modal_container .coolbtn {
  background-color: #e4e4e4;
}

.dark .modal-header {
  border-bottom: 1px solid #222222;
}

.dark .modal_container {
  background: rgb(26, 26, 26);
}

.modal_content .result {
  padding: 5px 5px 5px 5px;
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
    .fade-leave-to
    /* .fade-leave-active below version 2.1.8 */
    
 {
  opacity: 0;
}

.slideup-enter-active,
.slideup-leave-active {
  transform: scale(1);
  opacity: 1;
  transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.05);
}

.slideup-leave-to,
.slideup-enter {
  transform: scale(0.98);
  opacity: 0;
  transition: all 0.1s reverse cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slideupmodal-enter {
  transform: translateY(-50px);
  opacity: 1;
  transition: 100ms;
}

.slideupmodal-leave {
  transform: translateY(0px);
  opacity: 1;
  transition: 100ms;
}
</style>
