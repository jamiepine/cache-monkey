<template>
  <div class="input-container" :class="{'error': error, 'success': success}">
    <Heading v-if="heading" class="input-title" :text="heading"/>
    <p v-if="description" class="input-description">{{description}}</p>
    <div class="coolinput" :class="{'big': big, 'focus': focus}">
      <div class="prefix" v-if="prefix">{{prefix}}</div>
      <input
        :value="value"
        :placeholder="placeholder"
        @input="$emit('update', $event.target.value)"
        @focus="focus = true"
        @blur="focus = false"
        :type="type"
        :autofocus="autofocus"
        :readonly="readonly"
      >
      <icon v-if="loading" class="right-icon" :spin="true" icon="spinner"/>
    </div>
    <div class="input-message">{{message}}</div>
  </div>
</template>

<script>
export default {
  props: [
    "value",
    "placeholder",
    "big",
    "prefix",
    "error",
    "success",
    "heading",
    "description",
    "loading",
    "message",
    "type",
    "autofocus",
    "readonly"
  ],
  data() {
    return {
      focus: false
    };
  }
};
</script>

<style lang="scss" scoped>
.input-container {
  flex-direction: column;
  width: 100%;
  .coolinput {
    input {
      font-size: 11px;
    }
    position: relative;
    min-width: 150px;
    border-radius: 5px;
    background: var(--searchBackground);
    border: 1px solid var(--searchBorder);
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    transition: 150ms;
    &.big {
      input {
        margin: 11px;
        /* font-size: 18px; */
        flex-grow: 1;
      }
    }
    &.focus {
      border-color: var(--highlight);
    }
    input,
    .right-icon {
      margin: 8px 15px;
    }
    .prefix {
      font-size: 13px;
      font-weight: bold;
      padding: 16px;
      background: var(--box);
      border-radius: 5px 0 0 5px;
      border-right: 1px solid var(--searchBorder);
      color: var(--faintText);
      line-height: 18px;
    }
  }
  .input-title {
    margin-top: 20px;
  }
  p.input-description {
    margin: 0;
    margin-bottom: 10px;
  }
  .right-icon {
    margin-top: 3px;
    opacity: 0.7;
  }
  .input-message {
    font-size: 13px;
    padding: 3px 2px;
    font-weight: 500;
  }
  &.success {
    .coolinput {
      border-color: #44cf4f;
    }
    .input-message {
      color: #44cf4f;
    }
  }
  &.error {
    .coolinput {
      border-color: #cf4450;
    }
    .input-message {
      color: #cf4450;
    }
  }
}
</style>

