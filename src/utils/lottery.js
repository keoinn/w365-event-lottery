const PRIZE_SETTING_STRING =
  "特別獎|4|1|遠東集團2000元禮券/每人\n\n二獎|2|1|5萬元紅包/每人\n頭獎|1|1|東京來回機票";
const CANDIDATES_SETTING_STRING =
  "Tom, Marry, Jim, Robin \n Lucy, Lily, Lilei, Hanmeimei\nCatherine, Linton, Lockwood\nCharly, Bill, Emily, Penny\nRose, Jen, William, Philips\nHitler, Stalin";
const KEY_NAME = " Enter鍵 ";

class Lottery {
  constructor() {
    this.step = 0; // 獎項索引
    this.interval = 50; // 旋轉間隔 -> 需要重新設定
    this.lottery_index = -1; // 抽獎索引
    this.action = null; // 當前動作
    this.next_action = null; // 下一步動作
    this.stop = false; // 搖獎機停止訊號

    this.prizes = []; // 獎項
    this.candidates = []; // 候選人
    this.results = []; // 中獎人
    this.temp_winners = []; // 暫存中獎人
    this.final_results = []; // 最終中獎人

    this.prizes_setting_string = ""; // 獎項設定文字
    this.candidates_setting_string = ""; // 候選人設定文字

    // UI Date to Bind
    this.hasCheckedWinners = false; // 是否已檢查中獎人
    this.currentStageBox = ""; // 當前階段顯示文字
    this.eventTitleBox = ""; // 活動標題
    this.infoBox = ""; // 資訊顯示文字
    this.hitsBox = ""; // 提問顯示文字
    this.showRotateDiv = false; // 旋轉顯示區
    this.rollingBoard = ""; // 旋轉顯示文字
    this.timer = null; // 計時器
    this.infoBoxTimer = 500;
    this.hitsBoxTimer = 500;



    this.setEventTitle("摸彩活動");
    this.setInfoBox("");
    this.setHitsBox(
      `<span class="hits-box-text"><br><br><br>請按下${KEY_NAME}開始</span>`
    );
  }

  init() {
    this.step = 0;
    this.interval = 50;
    this.lottery_index = -1;
    this.action = null;
    this.next_action = "start_lottery";

    // Demo Data
    this.prizes_setting_string = PRIZE_SETTING_STRING;
    this.candidates_setting_string = CANDIDATES_SETTING_STRING;

    // Init UI and Data
    this.setPrizesSetting();
  }

  updateCandidates(candidates) {
    this.candidates = [];
    this.candidates = candidates;
  }

  process() {
    this.action = this.next_action;
    switch (this.action) {
      case "start_lottery": // 開始抽獎 = open() operation
        this.start_lottery();
        this.next_action = "draw_prize_start";
        break;
      case "draw_prize_start": // 開始抽獎 = on_step_open() operation
        this.showDrawPrizeInfo();
        this.next_action = "rotate_lottery";
        break;
      case "rotate_lottery": // 旋轉抽獎 = rotate_start() operation
        this.setHitsBox("");
        this.setInfoBox("");
        this.showRotateDiv = true;
        this.stop = false;
        this.rotate_lottery();
        this.next_action = "rotate_stop";
        setTimeout(() => {
          this.setHitsBox(
            `<span class="hits-box-text">請按下${KEY_NAME}抽出幸運兒</span>`
          );
        }, this.hitsBoxTimer);
        break;
      case "rotate_stop": // 旋轉停止 = rotate_stop() operation
        this.setHitsBox("");
        this.selectedWinners();
        this.next_action = "check_winners";
        break;
      case "check_winners": // 檢查中獎人 = check_winners() operation
        this.checkWinners();
        break;
      case "show_winners": // 顯示中獎人 = show_winners() operation
        this.showWinners();
        break;
      case "show_results": // 顯示中獎人 = show_results() operation
        this.showResults();
        break;
      case "end_lottery": // 結束抽獎 = end_lottery() operation
        this.end_lottery();
        break;
    }

    // console.log(`action: ${this.action} -> ${this.next_action}:`, this.candidates);
  }

  /**
   * 開始抽獎顯示所有獎項
   * open() | on_open()
   * @Note:
   *    1. 顯示獎項 (以倒序顯示)
   *    2. 使用 setPrintBox() 顯示獎項表格
   */
  start_lottery() {
    this.setHitsBox("");
    this.currentStageBox = "獎項列表";
    let prize_list = [...this.prizes];
    prize_list.reverse();
    let str = "<table align='center'>";
    str += "<tr><th>獎項</th><th>數量</th><th>獎品內容</th></tr>";
    prize_list.forEach((prize) => {
      str += `<tr><td>${prize.name}</td>`;
      str += `<td>${prize.num}</td>`;
      str += `<td>${prize.award}</td>`;
      str += "</tr>";
    });
    str += "</table>";
    this.setInfoBox(str);
    setTimeout(() => {
      this.setHitsBox(
        `<span class="hits-box-text"><br>請按下${KEY_NAME}開始</span>`
      );
    }, this.hitsBoxTimer);
  }

  /**
   * 顯示當前獎項
   * on_step_open() | step_open()
   * @Note:
   *    1. 顯示按 Enter 鍵開始抽獎
   *    2. 呼叫 setCurrentStepBox() 顯示當前獎項與抽出人數
   */
  showDrawPrizeInfo() {
    this.setCurrentStepBox("");
    this.setInfoBox("");
    this.setHitsBox("");
    setTimeout(() => {
      this.setCurrentStepBox();
    }, this.hitsBoxTimer);

    setTimeout(() => {
      this.setHitsBox(
        `<span class="hits-box-text"><br><br><br>請按下${KEY_NAME}開始搖獎</span>`
      );
    }, this.hitsBoxTimer);
  }

  /**
   * 旋轉抽獎
   * rotate_run()
   */
  rotate_lottery() {
    this.setInfoBox("");
    this.showRotateDiv = true;
    this.hasCheckedWinners = false;

    this.array_shuffle();

    let num_a = parseInt(this.prizes[this.step].num_a_time);
    let size =
      parseInt(this.prizes[this.step].num) -
      parseInt(this.results[this.step].length);
    if (size > num_a) {
      size = num_a;
    }

    this.lottery_index += num_a;
    if (this.lottery_index >= this.candidates.length) {
      this.lottery_index = 0;
    }

    let slice_list = this.array_slice(
      this.candidates,
      this.lottery_index,
      size
    );
    this.rollingBoard = slice_list.map(candidate => candidate.name).join(", ");

    if (!this.stop) {
      // 未停止 -> 繼續旋轉
      this.timer = setTimeout(() => {
        this.rotate_lottery();
      }, this.interval);
    } else {
      // 停止 -> 延遲 1 秒後顯示詢問文字
      setTimeout(() => {
        this.setInfoBox(
          `<span class="print-box-text">請問 ${this.rollingBoard} 中獎人是否在現場?</span>`
        );
      }, this.infoBoxTimer);
    }
  }

  /**
   * 選出中獎人 -> 延遲停止
   * selectedWinners()
   */
  selectedWinners() {
    // 延遲停止時間
    // 2000/0.9 -> 1000/0.8 -> 500/0.7
    let delay_time = 500;
    // 每次延遲時間減少比例
    let step_decrease = 0.7;
    this.interval += parseInt(step_decrease * this.interval);
    setTimeout(() => {
      this.interval += parseInt(step_decrease * this.interval);
    }, delay_time / 2);
    setTimeout(() => {
      this.stop = true;
    }, delay_time + parseInt(delay_time * Math.random()));
  }

  /**
   * 檢查中獎人
   * check_winners()
   * @Note:
   *    1. 中獎人不在現場 -> 重新抽獎 this.next_action = "rotate_lottery"
   *    2. 中獎人存在候選人中 -> 顯示中獎人 this.next_action = "show_winners"
   */
  checkWinners() {
    this.setInfoBox("");
    this.setHitsBox("");
    if (this.hasCheckedWinners) {
      this.next_action = "show_winners";
      this.showRotateDiv = false;
      setTimeout(() => {
        this.setInfoBox(
          `<span class="print-box-text"><h2>恭喜 ${this.rollingBoard} 中獎</h2></span>`
        );
      }, this.infoBoxTimer);
    } else {
      this.showRotateDiv = false;
      setTimeout(() => {
        this.setInfoBox(
          `<span class="print-box-text"><h2>那我們重新進行抽獎!</h2></span>`
        );
        this.setHitsBox(
          `<span class="hits-box-text"><br>請按下${KEY_NAME}繼續</span>`
        );
      }, this.hitsBoxTimer);
      this.next_action = "rotate_lottery";
      this.interval = 50;
      console.log(`update action: ${this.action} -> ${this.next_action}`);
    }
  }

  /**
   * 顯示中獎人
   * showWinners()
   * @Note:
   *    1. 判斷該獎項是否抽完
   *        a. 是 -> this.next_action = "show_results"
   *        b. 否 -> this.next_action = "rotate_lottery"
   */
  showWinners() {
    // 儲存中獎人
    let num_a = parseInt(this.prizes[this.step].num_a_time);
    let size =
      parseInt(this.prizes[this.step].num) -
      parseInt(this.results[this.step].length);
    if (size > num_a) {
      size = num_a;
    }

    let winners = [];
    for (let i = 0; i < size; i++) {
      let index = this.lottery_index + i;
      if (index >= this.candidates.length) {
        index = index - this.candidates.length;
      }
      winners.push(this.candidates[index]);
      this.results[this.step].push(this.candidates[index]);
    }

    // 從候選人中移除中獎人
    console.log('winners:', winners);
    this.candidates = this.candidates.filter(candidate => !winners.includes(candidate));

    // 判斷是否還有獎項未抽完
    if (this.results[this.step].length == this.prizes[this.step].num) {
      this.step += 1;
      this.next_action = "show_results";
      this.setHitsBox(
        `<span class='hits-box-text'><br>請按下${KEY_NAME}查看中獎名單</span>`
      );
    } else {
      this.interval = 50;
      this.next_action = "draw_prize_start";
      this.setHitsBox(
        `<span class='hits-box-text'><br>請按下${KEY_NAME}繼續抽出其他幸運兒</span>`
      );
    }
  }

  /**
   * 顯示獎項抽獎結果
   * showResults()
   * @Note:
   *    1. 判斷是否還有獎項未抽完
   *        a. 是 -> this.next_action = "end_lottery"
   *        b. 否 -> this.next_action = "draw_prize_start"
   */
  showResults() {
    // UI 顯示
    this.setInfoBox("");
    this.setHitsBox("");
    this.setCurrentStepBox("");

    setTimeout(() => {
      // let current_title = `${this.prizes[this.step - 1].name} - 共 ${
      //   this.prizes[this.step - 1].num
      // } 位得主`;
      let current_title = `${this.prizes[this.step - 1].name} - ${this.prizes[this.step - 1].award} `;
      this.setCurrentStepBox(current_title);
      let str = "";
      str +=
        "<span class='print-box-text winner'>&nbsp;* 中獎名單 *&nbsp;<br/><h2>";
      this.results[this.step - 1].forEach((winner) => {
        str += `  <span class='winner-name'>${winner.name}</span>`;
      });
      str += "</h2></span>";
      this.setInfoBox(str);

      // 判斷是否還有獎項未抽完
      if (this.step == this.prizes.length) {
        this.next_action = "end_lottery";
        this.setHitsBox(
          `<span class='hits-box-text'><br>請按下${KEY_NAME}結束</span>`
        );
      } else {
        this.interval = 50;
        this.next_action = "draw_prize_start";
        this.setHitsBox(
          `<span class='hits-box-text'><br>請按下${KEY_NAME}進行下一個獎項的抽獎</span>`
        );
      }
    }, 1000);
  }

  /**
   * 結束抽獎
   * end_lottery()
   */
  end_lottery() {
    this.setInfoBox("");
    this.setHitsBox("");
    this.setCurrentStepBox("");
    this.setEventTitle("得獎名單");

    let prize_list = [...this.prizes];
    let result_list = [...this.results];
    result_list.reverse();
    let str = "<table align='center'>";
    str +=
      "<tr><th>獎項</th><th>數量</th><th>獎品內容</th><th>中獎人</th></tr>";
    prize_list.reverse().forEach((prize, idx) => {
      str += `<tr><td>${prize.name}</td>`;
      str += `<td>${prize.num}</td>`;
      str += `<td>${prize.award}</td>`;
      str += `<td>`;
      let final_winners = [];
      result_list[idx].forEach((winner) => {
        str += `${winner.name}, `;
        final_winners.push(winner);
      });
      this.final_results.push({
        name: prize.name,
        num: prize.num,
        award: prize.award,
        winners: final_winners
      });
      str += "</td></tr>";
    });
    str += "</table>";
    this.setInfoBox(str);
  }

  /**
   * 設置當前步驟框的內容
   * @param {string} text - 要顯示的文字內容
   * @returns {void}
   */
  setCurrentStepBox(text) {
    if (text == undefined) {
      let found = this.results[this.step].length;
      let all = parseInt(this.prizes[this.step].num);
      let num_a = parseInt(this.prizes[this.step].num_a_time);
      let b = num_a + found > all ? all : num_a + found;
      let str = `${this.prizes[this.step].name} (${
        this.prizes[this.step].num
      } 個`;
      if (num_a != all) {
        if (num_a == 1) {
          str += `, 抽出第 ${found + 1} 位幸運兒`;
        } else {
          str += `, 抽出第 ${found + 1}~${b} 位幸運兒`;
        }
      }
      str += `)`;
      this.currentStageBox = str;
    } else if (text == "") {
      this.currentStageBox = "";
    } else {
      this.currentStageBox = text;
    }
  }

  /**
   * 設置獎項設定
   * @param {string} text - 獎項設定文字
   * @returns {void}
   * @example
   * lottery.setPrizesSetting("特別獎|4|2|遠東集團2000元禮券/每人\n二獎|2|2|5萬元紅包/每人\n)
   */
  setPrizesSetting() {
    // 解析獎項設定文字
    let prizes = this.prizes_setting_string.trim().split("\n");
    prizes.forEach((prize) => {
      let prize_info = prize.split("|");
      if (prize_info.length === 4) {
        this.prizes.push({
          name: prize_info[0].trim(),
          num: prize_info[1].trim(),
          num_a_time: prize_info[2].trim(),
          award: prize_info[3].trim(),
        });
      }
    });

    // 初始化中獎人結果
    this.prizes.forEach((prize) => {
      this.results.push([]);
    });

    // 初始化參加人
    let candidates = this.candidates_setting_string
      .replace(/,/g, "\n")
      .split("\n");
    candidates.forEach((candidate) => {
      if (candidate.trim() !== "") {
        this.candidates.push(candidate.trim());
      }
    });
  }

  /**
   * 設定活動標題
   * @param {string} text - 要顯示的標題文字
   * @returns {void}
   * @example
   * lottery.setTitleBox("摸彩活動")  // 將在畫面上顯示 <span><h1>摸彩活動</h1></span>
   *
   */
  setEventTitle(text) {
    this.eventTitleBox = `<span class="event-title-text">${text}</span>`;
  }

  /**
   * 設定資訊顯示文字
   * @param {string} text - 要顯示的資訊文字
   * @returns {void}
   * @example
   * lottery.setInfoBox("<span class="print-box-text">資訊文字</span>")
   */
  setInfoBox(text) {
    // this.print_box = `<span class="print-box-text">${text}</span>`
    this.infoBox = `${text}`;
  }

  /**
   * 設定提問顯示文字
   * @param {string} text - 要顯示的提問文字
   * @returns {void}
   * @example
   * lottery.setHitsBox("<span class="hits-box-text">提問文字</span>")
   */
  setHitsBox(text) {
    this.hitsBox = `${text}`;
  }

  array_shuffle() {
    for (let i = this.candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.candidates[i], this.candidates[j]] = [
        this.candidates[j],
        this.candidates[i],
      ];
    }
  }

  array_slice(list, start, count) {
    let ret;

    ret = list.slice(start, start + count);
    if (ret.length < count) {
      ret = ret.concat(list.slice(0, count - ret.length));
    }
    return ret;
  }
}

export default Lottery;
