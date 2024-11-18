<script setup>
import { ref, onMounted, watch } from "vue";
import background_img from "@/assets/forestbridge.jpg";
import Lottery from "@/utils/lottery";
import { onKeyStroke } from "@vueuse/core";
import lottery_bg from "@/assets/lottery_bg.webp";
import {
  getLotteryCandidates,
  getLotteryTicketsNums,
  storeLotteryFinalResults,
  getLotterySetting,
} from "@/utils/requests/apis";

import prize_pic_1 from "@/assets/p1.png";
import prize_pic_2 from "@/assets/p2.png";
import prize_pic_3 from "@/assets/p3.png";

const lottery = ref(new Lottery());
const showWelcomeBox = ref(true); // 歡迎訊息顯示
const showCandidatesNum = ref("--"); // 人數
let timer = null;
const dialog = ref(true);
const password = ref("w365admin");
const event_sn = ref("bk2l1va4pf");

const showCurrentCandidatesNum = async () => {
  const res = await getLotteryTicketsNums({ event_sn: event_sn.value });
  showCandidatesNum.value = res.data.result;
};

const checkPassword = async () => {
  const res = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password.value)
  );
  const hashArray = Array.from(new Uint8Array(res));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (
    hashHex ==
    "9d49d019f3a9e08b8bfeca58bd6a965127f79a657420a6041401e10c68a79a20"
  ) {
    dialog.value = false;
  }
};

watch(dialog, (newVal) => {
  if (!newVal) {
    lottery.value.init();
    showCurrentCandidatesNum();
    timer = setInterval(() => {
      showCurrentCandidatesNum();
    }, 10000);
  }
});

const changePrizePicBoxStyle = () => {
  if (lottery.value.step == 0) {
    return { backgroundImage: `url(${prize_pic_1})` };
  } else if (lottery.value.step == 1) {
    return { backgroundImage: `url(${prize_pic_2})` };
  } else if (lottery.value.step == 2) {
    return { backgroundImage: `url(${prize_pic_3})` };
  }
};

const changePrizePicBoxSrc = () => {
  if (lottery.value.step == 0) {
    return prize_pic_1;
  } else if (lottery.value.step == 1) {
    return prize_pic_2;
  } else if (lottery.value.step == 2) {
    return prize_pic_3;
  }
};

onMounted(async () => {
  onKeyStroke(["B", "b"], () => {
    if (dialog.value) {
      return;
    } else if (lottery.value.next_action === "rotate_lottery") {
      lottery.value.process();
    } else if (lottery.value.next_action === "rotate_stop") {
      lottery.value.process();
    }else{
      console.log("B Key is pressed");
      console.log(`action: ${lottery.value.action} -> ${lottery.value.next_action}`);
    }
  });

  onKeyStroke(["Enter"], async () => {
    
    if (dialog.value) {
      return;
    } else if (lottery.value.next_action === "start_lottery") {
      const res = await getLotteryCandidates({ event_sn: event_sn.value });
      const setting = await getLotterySetting({ event_sn: event_sn.value });
      lottery.value.updateCandidates(res.data.result);
      lottery.value.updatePrizesSetting(setting.data.result.settings);
      lottery.value.setPrizesSetting();
      showWelcomeBox.value = false;
      clearInterval(timer);
    } else if (lottery.value.next_action === "check_winners") {
      lottery.value.hasCheckedWinners = true;
    } else if (lottery.value.action === "end_lottery") {
      console.log(lottery.value.final_results);
      const res = await storeLotteryFinalResults({
        event_sn: event_sn.value,
        result: lottery.value.final_results,
      });
    }

    lottery.value.process();
  });

  onKeyStroke(["Escape"], () => {
    if (dialog.value) {
      return;
    } else if (lottery.value.next_action === "check_winners") {
      lottery.value.hasCheckedWinners = false;
      lottery.value.process();
    }
  });
});
</script>
<template>
  <div class="main-view" :style="{ backgroundImage: `url(${background_img})` }">
    <div class="event-app">
      <!-- https://png.pngtree.com/background/20210711/original/pngtree-winning-lottery-announcement-picture-image_1105179.jpg -->
      <div
        class="slider-view"
        :style="{
          backgroundImage: `url(${lottery_bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
        v-show="!dialog"
      >
        <div
          class="event-title"
          v-if="lottery.title_box !== ''"
          v-html="lottery.eventTitleBox"
        ></div>

        <div id="rotate_div">
          <div class="welcome-box" v-if="showWelcomeBox">
            <br />
            <br />
            <span class="welcome-text">活動即將開始</span>
            <br />
            <br />
            <span class="welcome-text"
              >目前共有
              <span style="color: #f33">{{ showCandidatesNum }}</span>
              人報名</span
            >
          </div>

          <transition>
            <v-container
              class="current-step-box"
              v-if="lottery.currentStageBox !== ''"
            >
              <v-row>
                <v-col>
                  {{ lottery.currentStageBox }}
                </v-col>
              </v-row>
              <v-row>
                <v-spacer></v-spacer>
                <v-col align-self="center">
                  <v-img
                    :height="300"
                    v-if="lottery.action === 'draw_prize_start'"
                    aspect-ratio="16/9"
                    :src="changePrizePicBoxSrc()"
                  ></v-img>
                </v-col>
                <v-spacer></v-spacer>
              </v-row>
            </v-container>
          </transition>

          <!-- <div class="prize-pic-box" :style="changePrizePicBoxStyle()">
            </div> -->

          <!-- { backgroundImage: `url(${lottery.prize_pic_box})` } -->

          <transition>
            <div class="rolling-board" v-if="lottery.showRotateDiv">
              <span
                :class="{ 'has-checked-winners': lottery.hasCheckedWinners }"
                >{{ lottery.rollingBoard }}</span
              >
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
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="320" persistent>
      <v-card prepend-icon="mdi-account" title="登入活動">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="event_sn"
                label="Event ID"
                type="text"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            text="開始"
            variant="tonal"
            @click="checkPassword()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<style lang="scss">
$event-title-color: #ff0;
$background-color: #000;
$text-background-color: #36f;
$text-color: #333;
$text-winner-color: rgb(255, 51, 61);

.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
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
      font-weight: bold;
      text-align: center;

      .event-title-text {
        padding: 0 32px;
        color: $text-background-color;
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
        color: $text-winner-color !important;
      }
    }

    .welcome-box {
      line-height: 42px;
      font-size: 42px;
      font-weight: bold;
      color: $text-color;
    }

    .current-step-box {
      line-height: 42px;
      font-size: 42px;
      font-weight: bold;
      color: $text-color;
      align-items: center;
      padding: 0 !important;
      margin: 0 !important;
    }

    .hits-box {
      font-weight: bold;
      font-size: 28px;
      margin-left: auto;
      margin-right: auto;

      .hits-box-text {
        // margin-left: -60px;
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
        .winner-name {
          background-color: yellow;
          color: $text-background-color;
        }
        .winner-check-name {
          background-color: yellow;
          color: $text-background-color;
        }
      }

      .winner {
        color: $text-winner-color;
      }

      table {
        margin: 12px auto;
        border-collapse: collapse;
        width: 100%;
        background: #fff;
        color: #333;
        font-size: 25px !important;
      }

      th,
      td {
        border: 2px solid #333;
      }
    }
  }
}
</style>
