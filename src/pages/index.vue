<template>
  <div class="main-view" :style="{ backgroundImage: `url(${background_img})` }">
    <div class="event-app">
      <!-- https://png.pngtree.com/background/20210711/original/pngtree-winning-lottery-announcement-picture-image_1105179.jpg -->
      <div class="slider-view" :style="{ backgroundImage: `url(${lottery_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
        <div
          class="event-title"
          v-if="lottery.title_box !== ''"
          v-html="lottery.eventTitleBox"
        ></div>

        <div id="rotate_div">
          <transition>
            <div
              class="current-step-box"
              v-if="lottery.currentStageBox !== ''"
            >
              {{ lottery.currentStageBox }}
            </div>
          </transition>

          <transition>
            <div class="rolling-board" v-if="lottery.showRotateDiv">
              <span :class="{'has-checked-winners': lottery.hasCheckedWinners}">{{ lottery.rollingBoard }}</span>
            </div>
          </transition>

          <transition>
            <div
              class="print-box"
              v-if="lottery.infoBox !== ''"
              v-html="lottery.infoBox"
            ></div>
          </transition>

          <transition>
            <div
              class="hits-box"
              v-if="lottery.hitsBox !== ''"
              v-html="lottery.hitsBox"
            ></div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import background_img from "@/assets/forestbridge.jpg";
import Lottery from "@/utils/lottery";
import { onKeyStroke } from "@vueuse/core";
import lottery_bg from "@/assets/lottery_bg.webp";

const lottery = ref(new Lottery());

onMounted(() => {
  lottery.value.init();

  onKeyStroke(["Enter", "B", "b"], () => {
    if(lottery.value.next_action === "check_winners") {
      lottery.value.hasCheckedWinners = true;
      lottery.value.process();
    } else  {
      lottery.value.process();
    }
  });

  onKeyStroke(["Escape"], () => {
    if(lottery.value.next_action === "check_winners") {
      lottery.value.hasCheckedWinners = false;
      lottery.value.process();
    }
  });



  // onKeyStroke(["Enter", "B", "b"], () => {
  //   if(lottery.value.temp_winners.length > 0) {
  //     lottery.value.checkWinners(true)
  //     lottery.value.process();
  //   } else {
  //     lottery.value.process();
  //   }
  //   console.log(lottery.value.action);
  // });

  // onKeyStroke(["Escape"], () => {
  //   console.log("Before", lottery.value)
  //   if(lottery.value.temp_winners.length > 0) {
  //     lottery.value.checkWinners(false)
  //   }
  //   console.log("After", lottery.value)
  // });
});
</script>

<style lang="scss">
$event-title-color: #ff0;
$background-color: #000;
$text-background-color: #36f;
$text-color: #333;

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.main-view {
  height: 100% !important;
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  background-position: center;
  background-size: cover;
  position: relative;
  color: white;
  font-family: monospace, Courier, "Courier New";
  font-size: 25px;
  display: flex;
  justify-content: center;

  .event-app {
    padding-top: 3%;
    width: 980px;

    .event-title {
      color: $event-title-color;
      margin: 26px;
      padding: 0;
      font-size: 56px;
      text-align: center;

      .event-title-text {
        padding: 0 32px;
        background: $text-background-color;
      }
    }

    .slider-view {
      padding: 4px;
      font-size: 14px;
      text-align: center;
      border: 3px solid $text-background-color;
      height: 580px;
    }

    .rolling-board {
      color: #000;
      line-height: 40px;
      font-size: 40px;
      font-weight: bold;
      margin: 34px auto;
      padding: 8px;
      width: 640px;
      text-align: center;
      background: #ff3;
      border: 6px solid #03f;

      .has-checked-winners {
        color: #f33 !important;
      }
    }

    .current-step-box {
      line-height: 42px;
      font-size: 42px;
      font-weight: bold;
      color: $text-color;
    }

    .hits-box {
      font-weight: bold;
      font-size: 28px;
      margin-left: auto;
      margin-right: auto;

      .hits-box-text {
        margin: 4px;
        color: $text-color;
      }
    }

    .print-box {
      margin-top: 30px;
      font-weight: bold;
      font-size: 28px;
      width: 70%;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
      color: #333;

      .print-box-text {
        margin: 4px;
        // background: $text-background-color;
      }
      .winner {
        color: #f33;
      }

      table {
        margin: 12px auto;
        border-collapse: collapse;
        width: 95%;
        background: #fff;
        color: #333;
      }

      th,
      td {
        border: 2px solid #333;
      }
    }
  }
}
</style>
