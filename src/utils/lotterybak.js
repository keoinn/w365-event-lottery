class Lottery {
  constructor() {
    this.step = -1;
    this.interval = 50;
    this.rotate_index = -1;
    this.action = "open";

    this.prizes = [];
    this.candidates = [];
    this.results = [];
    this.temp_winners = [];
    this.hasCheckedWinners = false;

    this.stop = false;

    // 顯示文字
    this.prizes_setting =
      "特別獎|4|2|遠東集團2000元禮券/每人\n\n二獎|2|2|5萬元紅包/每人\n頭獎|1|1|東京來回機票";
    this.candidates_setting =
      "Tom, Marry, Jim, Robin \n Lucy, Lily, Lilei, Hanmeimei\nCatherine, Linton, Lockwood\nCharly, Bill, Emily, Penny\nRose, Jen, William, Philips\nHitler, Stalin";
    this.current_step_box = "";
    this.title_box = "";
    this.print_box = "";
    this.showRotateDiv = false;
    this.rolling_board = "";
    this.timer = null;
  }

  init() {
    this.step = 0;
    this.stop = false;
    this.rotate_index = -1;
    this.action = "open";
    this.results = [];

    console.log("init");

    this.setPrizesSetting();
    this.setPrintBox(`<span class="print-box-text">按 Enter 開始</span>`);
    this.setTitleBox("摸彩活動");
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
    let prizes = this.prizes_setting.trim().split("\n");
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
    let candidates = this.candidates_setting.replace(/,/g, "\n").split("\n");
    candidates.forEach((candidate) => {
      if (candidate.trim() !== "") {
        this.candidates.push(candidate.trim());
      }
    });

    console.log(this.prizes);
    console.log(this.candidates);
  }

  // on_open()
  showPrizesList() {
    this.current_step_box = "獎項列表";
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
    this.setPrintBox(str);
  }

  // on_step_open()
  showPrizesInfo() {
    this.setCurrentStepBox();
    this.setPrintBox(`<span class="print-box-text">按 Enter 抽獎</span>`);
    // $("#rolling_board").html("...")
  }

  // on_rotate_start()
  drawingPrize() {
    console.log("drawingPrize");
    // TODO: 顯示轉盤
    this.showRotateDiv = true;
    this.hasCheckedWinners = false;

    // this.interval = 100
    this.stop = false;
    this.rotate_index = 0;
    this.array_shuffle();
    console.log(this.candidates);

    this.drawCandidates();

    this.setCurrentStepBox();
    this.setPrintBox(`<span class="print-box-text">按 Enter 停止</span>`);
  }

  // on_rotate_stop()
  selectedWinners() {
    // 延遲停止時間
    let delay_time = 2000;
    // 每次延遲時間減少比例
    let step_decrease = 0.9;
    this.interval += parseInt(step_decrease * this.interval);
    setTimeout(() => {
      this.interval += parseInt(step_decrease * this.interval);
    }, delay_time / 2);
    setTimeout(() => {
      this.stop = true;
    }, delay_time + parseInt(delay_time * Math.random()));
  }

  // rotate_run()
  drawCandidates() {
    let num_a = parseInt(this.prizes[this.step].num_a_time);
    let size =
      parseInt(this.prizes[this.step].num) -
      parseInt(this.results[this.step].length);
    if (size > num_a) {
      size = num_a;
    }

    this.rotate_index += num_a;
    if (this.rotate_index >= this.candidates.length) {
        this.rotate_index = 0;
    }
    let slice_list = this.array_slice(this.candidates, this.rotate_index, size);
    this.rolling_board = slice_list.join(", ");


    // 停止時清除定時器 -> 已經抽出中獎人
    if (this.stop) {
      this.action = "check_winners";
      clearTimeout(this.timer)
      this.setPrintBox("")
      
      for(let i = 0; i < size; i++) {
        let index = this.rotate_index + i
        if(index >= this.candidates.length) {
          index = index - this.candidates.length
        }
        this.temp_winners.push(index)
      }

      // 延遲 1 秒後顯示詢問文字
      setTimeout(() => {
        this.setPrintBox(`<span class="print-box-text">請問 ${this.rolling_board} 中獎人是否在現場?</span>`)
      }, 1000)
      

      console.log(this.candidates);
      console.log(this.rolling_board, this.rotate_index);
      console.log(this.temp_winners)
    } else {
      this.timer = setTimeout(() => {
        this.drawCandidates();
      }, this.interval);
    }
  }

  checkWinners(check_status = undefined) {
    // 檢查中獎人是否在現場
    if(check_status === undefined) {
        // waitting to check
    } else if (check_status === true) {
        // 人在現場 -> store to results
        this.temp_winners.forEach(winner => {
          this.results[this.step].push(this.candidates[winner])
        })

        // 搖獎結果從黑字改紅字
        this.hasCheckedWinners = true // 改變 Style 用
        // this.setPrintBox("請按 Enter 繼續")
        this.setPrintBox(`<span class="print-box-text">恭喜 ${this.rolling_board} 中獎</span>`)
        // 該獎項是否已完成抽獎
        if (this.results[this.step].length == this.prizes[this.step].num) {
            this.step += 1
          this.action = "show_result"
        } else {
            this.temp_winners = []
            this.action = "rotate_start"
        }
    } else if (check_status === false) {
        // 不在現場 -> 重新抽獎
        this.setPrintBox("")
        setTimeout(() => {
            this.setPrintBox(`<span class="print-box-text">那我們重新進行抽獎<br>請按 Enter 繼續</span>`)
            this.action = "rotate_start"
            this.temp_winners = []
        }, 1000)
    }
    
    this.interval = 50
  }

  // step_close
  showPrizeWinners(){
    console.log("showPrizeWinner")
    let str =""
    str += "<span class='print-box-text'>&nbsp;* 中獎名單 *&nbsp;<br/><br/>";
    this.results[this.step-1].forEach(winner => {
      str += `  ${winner}`
    })
    str += "</span>"
    this.setPrintBox(str)
  }

  process() {
    switch (this.action) {
      // 開始
      case "open":
        this.setPrintBox("");
        setTimeout(() => {
          this.action = "step_open";
          this.showPrizesList();
        }, 300);
        break;

      // 顯示獎品與個數
      case "step_open":
        this.action = "rotate_start";
        this.showRotateDiv = false;
        this.showPrizesInfo(); // on_step_open
        // this.showRotateDiv = true
        break;
    
      // 獎項抽獎完成
      case "step_close":
        if(this.step == this.prizes.length) {
            this.action = "close";
        } else {
            this.action = "step_open";
        }
        break;
    
    case 'show_result':
      this.showPrizeWinners();
      break;

      case "rotate_start":
        this.action = "rotate_stop";
        this.hasCheckedWinners = false // 改變 Style 用
        this.drawingPrize(); //on_rotate_start();
        break;

      case "rotate_stop":
        this.selectedWinners();
        break;
    
      case "check_winners":
        this.checkWinners();
        break;
    }
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

  /**
   * 設置顯示文字框的內容
   * @param {string} text - 要顯示的文字內容
   * @returns {void}
   * @example
   * lottery.setPrintBox("抽獎開始")  // 將在畫面上顯示 <span><h1>抽獎開始</h1></span>
   */
  setPrintBox(text) {
    // this.print_box = `<span class="print-box-text">${text}</span>`
    this.print_box = `${text}`;
  }

  /**
   * 設置標題框的內容
   * @param {string} text - 要顯示的標題文字
   * @returns {void}
   * @example
   * lottery.setTitleBox("摸彩活動")  // 將在畫面上顯示 <span><h1>摸彩活動</h1></span>
   */
  setTitleBox(text) {
    this.title_box = `<span class="event-title-text"> ${text}</span>`;
  }

  /**
   * 設置當前步驟框的內容
   * @param {string} text - 要顯示的文字內容
   * @returns {void}
   * @example
   * lottery.setCurrentStepBox()  // 將在畫面上顯示 <span class="current-step-box">特別獎 (4 個, 抽出第 1~4 位中獎人)</span>
   * show_current_step()
   */
  setCurrentStepBox(text) {
    if (text === undefined) {
      console.log(this.prizes);
      console.log(this.step);
      let found = this.results[this.step].length;
      let all = parseInt(this.prizes[this.step].num);
      let num_a = parseInt(this.prizes[this.step].num_a_time);
      let b = ((num_a + found )> all )? all : (num_a + found);
      console.log(found, all, num_a, b);
      let str = `${this.prizes[this.step].name} (${
        this.prizes[this.step].num
      } 個`;
      if (num_a != all) {
        str += `, 抽出第 ${found + 1}~${b} 位中獎人`;
      }
      str += `)`;
      this.current_step_box = str;
    } else if (text == "") {
      this.current_step_box = "";
    } else {
      this.current_step_box = text;
    }
  }
}

export default Lottery;
