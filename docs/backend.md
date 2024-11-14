# W365 Event Lottery Module - Backend

1. Backend 使用 CodeIgniter 4 開發
2. 資料庫使用 MariaDB
3. PHP 版本 8.2
4. 使用 Composer 管理套件
5. CodeIgniter 4 版本 4.5.5

## 相關程式碼

### 1. Database Migration

1. 2024-11-12-130043_AddLotteryTicketsTable.php
    ```php
    <?php

    namespace App\Database\Migrations;

    use CodeIgniter\Database\Migration;

    class AddLotteryTicketsTable extends Migration
    {
        public function up()
        {
            $this->forge->addField([
                'lt_id' => [
                    'type' => 'bigint',
                    'auto_increment' => true,
                    'comment' => 'Primary Key'
                ],
                'event_sn' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'null' => true,
                    'default' => null,
                    'comment' => 'EventID'
                ],
                'ticket_sn' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'comment' => 'Lottery Tickets SN'
                ],
                'name' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'comment' => 'User Name'
                ],
                'phone' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'comment' => 'Phone'
                ],
                'group' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'comment' => 'User\' group'
                ],
                'created_at' => [
                    'type' => 'datetime',
                    'null' => true,
                    'deafult' => null,
                    'comment' => '簽到時間'
                ],
                'updated_at' => [
                    'type' => 'datetime',
                    'null' => true,
                    'deafult' => null,
                    'comment' => '更新時間'
                ],
                'deleted_at' => [
                    'type' => 'datetime',
                    'null' => true,
                    'deafult' => null,
                    'comment' => '刪除時間'
                ],
            ]);
            $this->forge->addPrimaryKey('lt_id', 'EventLotteryTicket_pk');
            if($this->forge->createTable('lottery_tickets', false)){
                $this->db->query('ALTER TABLE `lottery_tickets` comment "摸彩券註冊";');
            }
        }

        public function down()
        {
            //
            $this->forge->dropTable('lottery_tickets');
        }
    }
    ```

2. 2024-11-12-131536_AddLotteryResultTable.php
    ```php
    <?php

    namespace App\Database\Migrations;

    use CodeIgniter\Database\Migration;

    class AddLotteryResultTable extends Migration
    {
        public function up()
        {
            $this->forge->addField([
                'rid' => [
                    'type' => 'bigint',
                    'auto_increment' => true,
                    'comment' => 'Primary Key'
                ],
                'event_sn' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'null' => true,
                    'default' => null,
                    'comment' => 'EventID'
                ],
                'result' =>[
                    'type' => 'json',
                    'null' => true,
                    'default' => null,
                    'comment' => '額外資訊(json)'
                ],
                'st' => [
                    'type' => 'TINYINT',
                    'default' => 1,
                    'comment' => 'delete or not',
                ],
            ]);
            $this->forge->addPrimaryKey('rid', 'LotteryEventResult_pk');
            if ($this->forge->createTable('lottery_result', false)) {
                // $this->db->query('ALTER TABLE `openevent_signin_sheet` AUTO_INCREMENT=1001');
                $this->db->query('ALTER TABLE `lottery_result` comment "摸彩活動結果";');
            }
        }

        public function down()
        {
            $this->forge->dropTable('lottery_result');
        }
    }

    ```

3. 2024-11-14-131902_AddLotteryEventSettingTable.php
    ```php
    <?php

    namespace App\Database\Migrations;

    use CodeIgniter\Database\Migration;

    class AddLotteryEventSettingTable extends Migration
    {
        public function up()
        {
            $this->forge->addField([
                'le_id' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'null' => true,
                    'default' => null,
                    'comment' => 'EventID'
                ],
                'event_sn' => [
                    'type' => 'varchar',
                    'constraint' => '50',
                    'null' => true,
                    'default' => null,
                    'comment' => 'EventID'
                ],
                'settings' => [
                    'type' => 'text',
                    'default' => null,
                    'comment' => '獎項設定文字儲存'
                ],
                'st' => [
                    'type' => 'TINYINT',
                    'default' => 1,
                    'comment' => '執行中(1: 進行, 0:已抽)',
                ],
            ]);
            $this->forge->addPrimaryKey('le_id', 'LotteryEventSetting_pk');
            if ($this->forge->createTable('lottery_setting', false)) {
                $this->db->query('ALTER TABLE `lottery_setting` comment "摸彩活動獎項設定";');
            }
        }

        public function down()
        {
            $this->forge->dropTable('lottery_setting');
        }
    }

    ```

### 2. Controller
* File: app/Controllers/Api/LotteryEvent.php
    ```php
    <?php

    namespace App\Controllers\Api;

    use App\Controllers\BaseController;
    use CodeIgniter\RESTful\ResourceController;
    use PDO;

    class LotteryEvent extends ResourceController
    {
        protected $res_data = array(
            'msg' => 'OK',
            'code' => '200',
            'result' => null,
            'status' => false,
        );


        public function index()
        {
            //
        }

        public function returnRes() {
            return $this->response
                        ->setJSON($this->res_data);
        }

        public function queryTickets(){

            $lotteryTicketsModel = new \App\Models\LotteryTicketModel();
            $event_id = $this->request->getVar('event_sn');
            $phone = $this->request->getVar('phone');

            if($event_id == '' || is_null($event_id)) {
                $this->res_data['code'] = 403;
                $this->res_data['msg'] = '找不到對應得抽獎活動，請重新掃描 QRCode 或洽工作人員！';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            if($phone == '' || is_null($phone)) {
                $this->res_data['code'] = 404;
                $this->res_data['msg'] = '您忘記填寫你的聯絡電話。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            $test_arary[] = $phone;
            $reg_test = preg_grep('/^09\\d{8}$/', $test_arary);

            if(sizeof($reg_test) == 0) {
                $this->res_data['code'] = 405;
                $this->res_data['msg'] = '您填寫的聯絡方式不符合手機號碼規則。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            $queryTicketInfo = $lotteryTicketsModel->where('event_sn', $event_id)->where('phone', $phone)->findAll();
            $queryTicketInfoNum = sizeof($queryTicketInfo);

            if($queryTicketInfoNum == 0){
                $this->res_data['code'] = 300;
                $this->res_data['msg'] = '這個手機號碼尚未登錄';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }else if($queryTicketInfoNum == 1){
                $ticket_sn = $queryTicketInfo[0]['ticket_sn'];
                $this->res_data['code'] = 200;
                $this->res_data['msg'] = "您的摸彩券序號是 #$ticket_sn";
                $this->res_data['result'] = null;
                $this->res_data['status'] = true;
                return $this->returnRes();
            } else {
                $this->res_data['code'] = 400;
                $this->res_data['msg'] = '系統異常，請洽工作人員。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }



        }

        public function issueTickets() {
            $lotteryTicketsModel = new \App\Models\LotteryTicketModel();

            $event_id = $this->request->getVar('event_sn');
            $group = $this->request->getVar('group');
            $phone = $this->request->getVar('phone');
            $name = $this->request->getVar('name');

            if($event_id == '' || is_null($event_id)) {
                $this->res_data['code'] = 403;
                $this->res_data['msg'] = '找不到對應得抽獎活動，請重新掃描 QRCode 或洽工作人員！';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            if($phone == '' || is_null($phone)) {
                $this->res_data['code'] = 404;
                $this->res_data['msg'] = '您忘記填寫你的聯絡電話。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            $test_arary[] = $phone;
            $reg_test = preg_grep('/^09\\d{8}$/', $test_arary);

            if(sizeof($reg_test) == 0) {
                $this->res_data['code'] = 405;
                $this->res_data['msg'] = '您填寫的聯絡方式不符合手機號碼規則。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }


            if($name == '' || is_null($name)) {
                $this->res_data['code'] = 406;
                $this->res_data['msg'] = '您忘記填寫您的尊稱大名。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }

            $check = $lotteryTicketsModel->validatePhoneExist($event_id, $phone);

            if(!$check){
                $ticket_sn = $lotteryTicketsModel->getCurrentTicketsNum($event_id);
                $ticket_sn = $ticket_sn + 1;
                $ins_data = array(
                    'event_sn' => $event_id,
                    'ticket_sn' => $ticket_sn,
                    'name' => $name,
                    'phone' => $phone,
                    'group' => $group,
                );
                $lotteryTicketsModel->save($ins_data);

                $result = $lotteryTicketsModel->getInsertID();
                if($result > 0) {
                    $this->res_data['code'] = 200;
                    $this->res_data['msg'] = "您的摸彩券序號是 #$ticket_sn";
                    $this->res_data['result'] = null;
                    $this->res_data['status'] = true;
                } else {
                    $this->res_data['code'] = 401;
                    $this->res_data['msg'] = "目前系統正在維護中，請洽工作人員。";
                    $this->res_data['result'] = null;
                    $this->res_data['status'] = false;
                }
                return $this->returnRes();

            }else{
                $this->res_data['code'] = 402;
                $this->res_data['msg'] = '該手機號碼已經被登錄，請洽工作人員。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
                return $this->returnRes();
            }
        }

        public function getLotteryCandidates(){
            $lotterTicketsModel = new \App\Models\LotteryTicketModel();
            $event_id = $this->request->getVar('event_sn');
            $res = $lotterTicketsModel->select('ticket_sn, name, phone')->where('event_sn', $event_id)->findAll();

            $this->res_data['code'] = 200;
            $this->res_data['msg'] = 'OK';
            $this->res_data['result'] = $res;
            $this->res_data['status'] = true;

            return $this->returnRes();
        }

        public function getLotteryCandidatesNum(){
            $lotterTicketsModel = new \App\Models\LotteryTicketModel();
            $event_id = $this->request->getVar('event_sn');
            $res = $lotterTicketsModel->getCurrentTicketsNum($event_id);

            $this->res_data['code'] = 200;
            $this->res_data['msg'] = 'OK';
            $this->res_data['result'] = $res;
            $this->res_data['status'] = true;

            return $this->returnRes();
        }

        public function saveLotteryResult(){
            $lotteryResult = new \App\Models\LotteryResultModel();
            $event_sn = $this->request->getVar('event_sn');
            $lottery_result = $this->request->getVar('result');
            $res = $lotteryResult->save([
                'event_sn' => $event_sn,
                'result' => json_encode($lottery_result, JSON_UNESCAPED_UNICODE)
            ]);

            $this->res_data['code'] = 200;
            $this->res_data['msg'] = 'OK';
            $this->res_data['result'] = $res;
            $this->res_data['response'] = $lottery_result;
            $this->res_data['status'] = true;
            return $this->returnRes();
            
        }

        public function getLotterySetting(){
            $lotterySettingModel = new \App\Models\LotterySettingModel();
            $event_sn = $this->request->getVar('event_sn');
            $query = $lotterySettingModel->where('event_sn', $event_sn)->findAll();
            if(sizeof($query) == 1) {
                $this->res_data['code'] = 200;
                $this->res_data['msg'] = 'OK';
                $this->res_data['result'] = $query[0];
                $this->res_data['status'] = true;
                $this->res_data['response'] = $event_sn;
            }else {
                $this->res_data['code'] = 400;
                $this->res_data['msg'] = '系統維護中, 請洽管理員。';
                $this->res_data['result'] = null;
                $this->res_data['status'] = false;
            }

            return $this->returnRes();
        }
    }

    ```

### 3. Model

1. LotteryTicketModel.php
    ```php
    <?php

    namespace App\Models;

    use CodeIgniter\Model;

    class LotteryTicketModel extends Model
    {
        protected $DBGroup          = 'default';
        protected $table            = 'lottery_tickets';
        protected $primaryKey       = 'lt_id';
        protected $useAutoIncrement = true;
        protected $insertID         = 0;
        protected $returnType       = 'array';
        protected $useSoftDeletes   = false;
        protected $protectFields    = true;
        protected $allowedFields    = [
            'event_sn',
            'ticket_sn',
            'name',
            'phone',
            'group',
        ];

        // Dates
        protected $useTimestamps = true;
        protected $dateFormat    = 'datetime';
        protected $createdField  = 'created_at';
        protected $updatedField  = 'updated_at';
        protected $deletedField  = 'deleted_at';

        // Validation
        protected $validationRules      = [];
        protected $validationMessages   = [];
        protected $skipValidation       = false;
        protected $cleanValidationRules = true;

        // Callbacks
        protected $allowCallbacks = true;
        protected $beforeInsert   = [];
        protected $afterInsert    = [];
        protected $beforeUpdate   = [];
        protected $afterUpdate    = [];
        protected $beforeFind     = [];
        protected $afterFind      = [];
        protected $beforeDelete   = [];
        protected $afterDelete    = [];


        public function getCurrentTicketsNum ($event_id = null) {
            $builder= $this->db->table($this->table);
            if(!is_null($event_id)) {
                $builder->where('event_sn', $event_id);
            }
            $query = $builder->get();
            return $query->getNumRows();
        }

        public function validatePhoneExist($event_id, $phone) {
            $builder = $this->db->table($this->table);
            $builder->where('event_sn', $event_id);
            $builder->where('phone', $phone);

            $query = $builder->get();
            if($query->getNumRows() == 0){
                return false;
            } else {
                return true;
            }
        }
    }
    ```

2. LotteryResultModel.php
    ```php
    <?php

    namespace App\Models;

    use CodeIgniter\Model;

    class LotteryResultModel extends Model
    {
        protected $table            = 'lottery_result';
        protected $primaryKey       = 'rid';
        protected $useAutoIncrement = true;
        protected $returnType       = 'array';
        protected $useSoftDeletes   = false;
        protected $protectFields    = true;
        protected $allowedFields    = [
            'event_sn',
            'result',
            'st'
        ];

        protected bool $allowEmptyInserts = false;
        protected bool $updateOnlyChanged = true;

        protected array $casts = [];
        protected array $castHandlers = [];

        // Dates
        protected $useTimestamps = false;
        protected $dateFormat    = 'datetime';
        protected $createdField  = 'created_at';
        protected $updatedField  = 'updated_at';
        protected $deletedField  = 'deleted_at';

        // Validation
        protected $validationRules      = [];
        protected $validationMessages   = [];
        protected $skipValidation       = false;
        protected $cleanValidationRules = true;

        // Callbacks
        protected $allowCallbacks = true;
        protected $beforeInsert   = [];
        protected $afterInsert    = [];
        protected $beforeUpdate   = [];
        protected $afterUpdate    = [];
        protected $beforeFind     = [];
        protected $afterFind      = [];
        protected $beforeDelete   = [];
        protected $afterDelete    = [];
    }

    ```

3. LotterySettingModel.php
    ```php
    <?php

    namespace App\Models;

    use CodeIgniter\Model;

    class LotterySettingModel extends Model
    {
        protected $table            = 'lottery_setting';
        protected $primaryKey       = 'le_id';
        protected $useAutoIncrement = true;
        protected $returnType       = 'array';
        protected $useSoftDeletes   = false;
        protected $protectFields    = true;
        protected $allowedFields    = [
            'event_sn',
            'settings',
            'st',
        ];

        protected bool $allowEmptyInserts = false;
        protected bool $updateOnlyChanged = true;

        protected array $casts = [];
        protected array $castHandlers = [];

        // Dates
        protected $useTimestamps = false;
        protected $dateFormat    = 'datetime';
        protected $createdField  = 'created_at';
        protected $updatedField  = 'updated_at';
        protected $deletedField  = 'deleted_at';

        // Validation
        protected $validationRules      = [];
        protected $validationMessages   = [];
        protected $skipValidation       = false;
        protected $cleanValidationRules = true;

        // Callbacks
        protected $allowCallbacks = true;
        protected $beforeInsert   = [];
        protected $afterInsert    = [];
        protected $beforeUpdate   = [];
        protected $afterUpdate    = [];
        protected $beforeFind     = [];
        protected $afterFind      = [];
        protected $beforeDelete   = [];
        protected $afterDelete    = [];
    }

    ```

### 4. Routes
* File: app/Config/Routes.php
    ```php
    <?php

    use CodeIgniter\Router\RouteCollection;

    /**
     * @var RouteCollection $routes
     */
    $routes->group('/api/utilite/query-lottery-tickets', ['filter' => 'cors'] ,static function (RouteCollection $routes): void {
        $routes->post('', 'Api\LotteryEvent::queryTickets');
        $routes->options('', static function (){
            $response = response();
            $response->setStatusCode(200);
            return $response;
        });
    });

    $routes->group('/api/utilite/get-lottery-candidates', ['filter' => 'cors'] ,static function (RouteCollection $routes): void {
        $routes->post('', 'Api\LotteryEvent::getLotteryCandidates');
        $routes->options('', static function (){
            $response = response();
            $response->setStatusCode(200);
            return $response;
        });
    });

    $routes->group('/api/utilite/get-lottery-num', ['filter' => 'cors'] ,static function (RouteCollection $routes): void {
        $routes->post('', 'Api\LotteryEvent::getLotteryCandidatesNum');
        $routes->options('', static function (){
            $response = response();
            $response->setStatusCode(200);
            return $response;
        });
    });

    $routes->group('/api/utilite/get-lottery-final-results', ['filter' => 'cors'] ,static function (RouteCollection $routes): void {
        $routes->post('', 'Api\LotteryEvent::saveLotteryResult');
        $routes->options('', static function (){
            $response = response();
            $response->setStatusCode(200);
            return $response;
        });
    });

    $routes->group('/api/utilite/get-lottery-settings', ['filter' => 'cors'] ,static function (RouteCollection $routes): void {
        $routes->post('', 'Api\LotteryEvent::getLotterySetting');
        $routes->options('', static function (){
            $response = response();
            $response->setStatusCode(200);
            return $response;
        });
    });
    ```


### 5. Framework CORS 設定
* File: app/Config/Filters.php
    ```php
    // ...
    public array $aliases = [
        'csrf'          => CSRF::class,
        'toolbar'       => DebugToolbar::class,
        'honeypot'      => Honeypot::class,
        'invalidchars'  => InvalidChars::class,
        'secureheaders' => SecureHeaders::class,
        'cors'          =>  \App\Filters\RequestsCORSPolicyFilter::class, // Cors::class,
        'forcehttps'    => ForceHTTPS::class,
        'pagecache'     => PageCache::class,
        'performance'   => PerformanceMetrics::class,
    ];
    // ...
    ```

* File: app/Filters/RequestsCORSPolicyFilter.php
    ```php
    <?php

    namespace App\Filters;

    use CodeIgniter\Filters\FilterInterface;
    use CodeIgniter\HTTP\RequestInterface;
    use CodeIgniter\HTTP\ResponseInterface;

    class RequestsCORSPolicyFilter implements FilterInterface
    {
        /**
         * Do whatever processing this filter needs to do.
         * By default it should not return anything during
         * normal execution. However, when an abnormal state
         * is found, it should return an instance of
         * CodeIgniter\HTTP\Response. If it does, script
         * execution will end and that Response will be
         * sent back to the client, allowing for error pages,
         * redirects, etc.
         *
         * @param RequestInterface $request
         * @param array|null       $arguments
         *
         * @return RequestInterface|ResponseInterface|string|void
         */
        public function before(RequestInterface $request, $arguments = null)
        {
            //
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Headers: X-API-KEY, Origin,X-Requested-With, Content-Type, Accept, Access-Control-Requested-Method, Authorization");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PATCH, PUT, DELETE, OPTIONS");
            header("Access-Control-Max-Age: 600");
        }

        /**
         * Allows After filters to inspect and modify the response
         * object as needed. This method does not allow any way
         * to stop execution of other after filters, short of
         * throwing an Exception or Error.
         *
         * @param RequestInterface  $request
         * @param ResponseInterface $response
         * @param array|null        $arguments
         *
         * @return ResponseInterface|void
         */
        public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
        {
            //
        }
    }

    ```

### 6. UI
* File: src/pages/lottery_ticket.vue
    ```php
    <?= $this->extend('UI/template/tiny_template') ?>

    <?= $this->section('title') ?>
    e365 活動 - 摸彩券
    <?= $this->endSection() ?>

    <?= $this->section('extra_header') ?>
    <script>
        const api_url = "<?php echo $api_url; ?>";
        const event_id = "<?php echo $event_id; ?>";
        // https://liff.synet-app.com/lottery-tickets/bk2l1va4pf
        console.log(event_id)
    </script>
    <?= $this->endSection() ?>

    <?= $this->section('body_class') ?>
    hold-transition login-page app-member-parkingticket
    <?= $this->endSection() ?>

    <?= $this->section('content') ?>
    <!-- Content Wrapper. Contains page content -->
    <div class="login-box">
        <!-- /.login-logo -->
        <div class="card card-outline card-primary">
            <div class="card-header text-center">
                <h2 id="user_name_header"><b>摸彩券</b></h1>
            </div>
            <div class="card-body" id="lottery-form">
                <form>
                    <div class="col-12">
                        <label for="input-vehicle-sn" class="form-label">社名: </label>
                        <input type="text" id="input-group" autocomplete="off" class="form-control" required>
                    </div>
                    <div class="col-12">
                        <label for="input-vehicle-sn" class="form-label">名字: </label>
                        <input type="text" id="input-name" autocomplete="off" class="form-control" required>
                    </div>
                    <div class="col-12">
                        <label for="input-vehicle-sn" class="form-label">手機: </label>
                        <input type="text" id="input-phone" autocomplete="off" inputmode="numeric" class="form-control" required>
                    </div>
                </form>
                <br>
                <a href="#" onclick="changeAction('query')"> 查詢摸彩券序號 </a>
                <div class="social-auth-links text-center mt-2 mb-3">
                    <button class="btn btn-primary btn-block" type="button" id="getTicket">填寫摸彩資訊</button>
                </div>
            </div>

            <div class="card-body" id="lottery-query" style="display: none;">
                <form>
                    <div class="col-12">
                        <label for="input-vehicle-sn" class="form-label">登錄的手機: </label>
                        <input type="text" id="query-phone" autocomplete="off" inputmode="numeric" class="form-control" required>
                    </div>
                </form>
                <br>
                <a href="#" onclick="changeAction('form')"> 填寫摸彩券 </a>
                <div class="social-auth-links text-center mt-2 mb-3">
                    <button class="btn btn-primary btn-block" type="button" id="queryTicket">查詢序號</button>
                </div>
            </div>


            <!-- /.card-body -->
        </div>
        <!-- /.card -->
    </div>
    <!-- /.login-box -->




    <?= $this->endSection() ?>

    <?= $this->section('script_section') ?>
    <script>
        // Swal.fire({
        //     position: 'center',
        //     icon: 'success',
        //     title: 'Your work has been saved',
        //     showConfirmButton: false,
        //     timer: 1500
        // });

        console.log(api_url)

        let lottery_form_div = document.querySelector('#lottery-form')
        let lottery_query_div = document.querySelector("#lottery-query")

        const changeAction = (action) => {
            console.log(action)
            if (action == 'query') {
                lottery_form_div.style.display = 'none';
                lottery_query_div.style.display = 'block';
            } else {
                lottery_form_div.style.display = 'block';
                lottery_query_div.style.display = 'none';
            }
        }

        let btn = document.querySelector('#getTicket')
        let query_btn = document.querySelector('#queryTicket')
        btn.addEventListener('click', () => {
            axios.post(api_url + '/utilite/lottery-tickets', {
                event_sn: event_id,
                group: document.querySelector('#input-group').value,
                name: document.querySelector('#input-name').value,
                phone: document.querySelector('#input-phone').value,
            }).then(res => {
                console.log(res.data)
                if (!res.data.status) {
                    Swal.fire({
                        icon: 'error',
                        title: res.data.msg,
                        heightAuto: false,
                        showConfirmButton: true,
                    })
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: res.data.msg,
                        heightAuto: false,
                        showConfirmButton: true,
                    })
                }
            })


        })

        query_btn.addEventListener('click', () => {
            axios.post(api_url + '/utilite/query-lottery-tickets', {
                event_sn: event_id,
                phone: document.querySelector('#query-phone').value,
            }).then((res) => {
                console.log(res.data)
                if (!res.data.status) {
                    if (res.data.code == 300) {
                        Swal.fire({
                            icon: 'info',
                            title: res.data.msg,
                            html: `點右邊連結去登入摸彩券`+
                                `<a href="#" onclick="changeAction('form'); swal.close();"> 填寫摸彩券 </a>`,
                            heightAuto: false,
                            showConfirmButton: true,
                        })
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: res.data.msg,
                            heightAuto: false,
                            showConfirmButton: true,
                        })
                    }
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: res.data.msg,
                        heightAuto: false,
                        showConfirmButton: true,
                    })
                }
            })
        })
    </script>

    <?= $this->endSection() ?>
    ```

### 7. Mockdata
```sql
INSERT INTO `lottery_tickets` (`lt_id`, `event_sn`, `ticket_sn`, `name`, `phone`, `group`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'bk2l1va4pf', '118', '陳大文', '0912876543', '中山', '2024-11-13 03:10:11', '2024-11-13 03:10:11', NULL),
(2, 'bk2l1va4pf', '119', '林小華', '0987654321', '信義', '2024-11-13 03:12:15', '2024-11-13 03:12:15', NULL),
(3, 'bk2l1va4pf', '120', '王大明', '0976543210', '大安', '2024-11-13 03:15:20', '2024-11-13 03:15:20', NULL),
(4, 'bk2l1va4pf', '1', '張三', '0937243582', '中山', '2024-11-13 03:18:23', '2024-11-13 03:18:23', NULL),
(5, 'bk2l1va4pf', '2', '李四', '0999192466', '中興', '2024-11-13 03:26:34', '2024-11-13 03:26:34', NULL),
(6, 'bk2l1va4pf', '3', '王五', '0912345678', '松山', '2024-11-13 03:35:12', '2024-11-13 03:35:12', NULL),
(7, 'bk2l1va4pf', '4', '陳六', '0923456789', '信義', '2024-11-13 03:42:45', '2024-11-13 03:42:45', NULL),
(8, 'bk2l1va4pf', '5', '林七', '0934567890', '大安', '2024-11-13 03:55:18', '2024-11-13 03:55:18', NULL),
(9, 'bk2l1va4pf', '6', '吳八', '0945678901', '中正', '2024-11-13 04:12:33', '2024-11-13 04:12:33', NULL),
(10, 'bk2l1va4pf', '7', '趙九', '0956789012', '萬華', '2024-11-13 04:25:47', '2024-11-13 04:25:47', NULL),
(11, 'bk2l1va4pf', '8', '周小明', '0912123456', '大同', '2024-11-13 04:30:11', '2024-11-13 04:30:11', NULL),
(12, 'bk2l1va4pf', '9', '劉大華', '0923234567', '士林', '2024-11-13 04:35:22', '2024-11-13 04:35:22', NULL),
(13, 'bk2l1va4pf', '10', '張美玲', '0934345678', '北投', '2024-11-13 04:40:33', '2024-11-13 04:40:33', NULL),
(14, 'bk2l1va4pf', '11', '李志豪', '0945456789', '內湖', '2024-11-13 04:45:44', '2024-11-13 04:45:44', NULL),
(15, 'bk2l1va4pf', '12', '王雅婷', '0956567890', '南港', '2024-11-13 04:50:55', '2024-11-13 04:50:55', NULL),
(16, 'bk2l1va4pf', '13', '陳建志', '0967678901', '文山', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(17, 'bk2l1va4pf', '14', '林佳穎', '0978789012', '中山', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(18, 'bk2l1va4pf', '15', '吳俊傑', '0989890123', '中興', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(19, 'bk2l1va4pf', '16', '黃淑芬', '0990901234', '松山', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(20, 'bk2l1va4pf', '17', '趙明宏', '0911012345', '信義', '2024-11-13 05:15:10', '2024-11-13 05:15:10', NULL),
(21, 'bk2l1va4pf', '18', '周文傑', '0912111222', '中山', '2024-11-13 05:20:15', '2024-11-13 05:20:15', NULL),
(22, 'bk2l1va4pf', '19', '林美玲', '0913222333', '信義', '2024-11-13 05:25:20', '2024-11-13 05:25:20', NULL),
(23, 'bk2l1va4pf', '20', '張家豪', '0914333444', '大安', '2024-11-13 05:30:25', '2024-11-13 05:30:25', NULL),
(24, 'bk2l1va4pf', '21', '王小明', '0915444555', '中正', '2024-11-13 05:35:30', '2024-11-13 05:35:30', NULL),
(25, 'bk2l1va4pf', '22', '李雅婷', '0916555666', '萬華', '2024-11-13 05:40:35', '2024-11-13 05:40:35', NULL),
(26, 'bk2l1va4pf', '23', '陳俊傑', '0917666777', '大同', '2024-11-13 05:45:40', '2024-11-13 05:45:40', NULL),
(27, 'bk2l1va4pf', '24', '林志豪', '0918777888', '士林', '2024-11-13 05:50:45', '2024-11-13 05:50:45', NULL),
(28, 'bk2l1va4pf', '25', '張美琪', '0919888999', '北投', '2024-11-13 05:55:50', '2024-11-13 05:55:50', NULL),
(29, 'bk2l1va4pf', '26', '吳建志', '0920999000', '內湖', '2024-11-13 06:00:55', '2024-11-13 06:00:55', NULL),
(30, 'bk2l1va4pf', '27', '蔡佳玲', '0921000111', '南港', '2024-11-13 06:05:00', '2024-11-13 06:05:00', NULL),
(31, 'bk2l1va4pf', '28', '黃志偉', '0922111222', '文山', '2024-11-13 06:10:05', '2024-11-13 06:10:05', NULL),
(32, 'bk2l1va4pf', '29', '謝雅芬', '0923222333', '中山', '2024-11-13 06:15:10', '2024-11-13 06:15:10', NULL),
(33, 'bk2l1va4pf', '30', '鄭家豪', '0924333444', '信義', '2024-11-13 06:20:15', '2024-11-13 06:20:15', NULL),
(34, 'bk2l1va4pf', '31', '劉靜怡', '0925444555', '大安', '2024-11-13 06:25:20', '2024-11-13 06:25:20', NULL),
(35, 'bk2l1va4pf', '32', '沈建國', '0926555666', '中正', '2024-11-13 06:30:25', '2024-11-13 06:30:25', NULL),
(36, 'bk2l1va4pf', '33', '朱麗華', '0927666777', '萬華', '2024-11-13 06:35:30', '2024-11-13 06:35:30', NULL),
(37, 'bk2l1va4pf', '34', '范志明', '0928777888', '大同', '2024-11-13 06:40:35', '2024-11-13 06:40:35', NULL),
(38, 'bk2l1va4pf', '35', '周雅琪', '0929888999', '士林', '2024-11-13 06:45:40', '2024-11-13 06:45:40', NULL),
(39, 'bk2l1va4pf', '36', '許俊傑', '0930999000', '北投', '2024-11-13 06:50:45', '2024-11-13 06:50:45', NULL),
(40, 'bk2l1va4pf', '37', '郭靜宜', '0931000111', '內湖', '2024-11-13 06:55:50', '2024-11-13 06:55:50', NULL),
(41, 'bk2l1va4pf', '38', '邱建華', '0932111222', '南港', '2024-11-13 07:00:55', '2024-11-13 07:00:55', NULL),
(42, 'bk2l1va4pf', '39', '曾雅玲', '0933222333', '文山', '2024-11-13 07:05:00', '2024-11-13 07:05:00', NULL),
(43, 'bk2l1va4pf', '40', '廖志豪', '0934333444', '中山', '2024-11-13 07:10:05', '2024-11-13 07:10:05', NULL),
(44, 'bk2l1va4pf', '41', '簡美玲', '0935444555', '信義', '2024-11-13 07:15:10', '2024-11-13 07:15:10', NULL),
(45, 'bk2l1va4pf', '42', '潘建志', '0936555666', '大安', '2024-11-13 07:20:15', '2024-11-13 07:20:15', NULL),
(46, 'bk2l1va4pf', '43', '趙雅婷', '0937666777', '中正', '2024-11-13 07:25:20', '2024-11-13 07:25:20', NULL),
(47, 'bk2l1va4pf', '44', '何俊賢', '0938777888', '萬華', '2024-11-13 07:30:25', '2024-11-13 07:30:25', NULL),
(48, 'bk2l1va4pf', '45', '馮小琪', '0939888999', '大同', '2024-11-13 07:35:30', '2024-11-13 07:35:30', NULL),
(49, 'bk2l1va4pf', '46', '朱建銘', '0940999000', '士林', '2024-11-13 07:40:35', '2024-11-13 07:40:35', NULL),
(50, 'bk2l1va4pf', '47', '盧雅文', '0941000111', '北投', '2024-11-13 07:45:40', '2024-11-13 07:45:40', NULL),
(51, 'bk2l1va4pf', '48', '施志強', '0942111222', '內湖', '2024-11-13 07:50:45', '2024-11-13 07:50:45', NULL),
(52, 'bk2l1va4pf', '49', '余佳蓉', '0943222333', '南港', '2024-11-13 07:55:50', '2024-11-13 07:55:50', NULL),
(53, 'bk2l1va4pf', '50', '魏志豪', '0944333444', '文山', '2024-11-13 08:00:55', '2024-11-13 08:00:55', NULL),
(54, 'bk2l1va4pf', '51', '凃雅惠', '0945444555', '中山', '2024-11-13 08:05:00', '2024-11-13 08:05:00', NULL),
(55, 'bk2l1va4pf', '52', '范建德', '0946555666', '信義', '2024-11-13 08:10:05', '2024-11-13 08:10:05', NULL),
(56, 'bk2l1va4pf', '53', '湯雅婷', '0947666777', '大安', '2024-11-13 08:15:10', '2024-11-13 08:15:10', NULL),
(57, 'bk2l1va4pf', '54', '姜俊宏', '0948777888', '中正', '2024-11-13 08:20:15', '2024-11-13 08:20:15', NULL),
(58, 'bk2l1va4pf', '55', '江雅琳', '0949888999', '萬華', '2024-11-13 08:25:20', '2024-11-13 08:25:20', NULL),
(59, 'bk2l1va4pf', '56', '童建華', '0950999000', '大同', '2024-11-13 08:30:25', '2024-11-13 08:30:25', NULL),
(60, 'bk2l1va4pf', '57', '顏雅萍', '0951000111', '士林', '2024-11-13 08:35:30', '2024-11-13 08:35:30', NULL),
(61, 'bk2l1va4pf', '58', '柯志明', '0952111222', '北投', '2024-11-13 08:40:35', '2024-11-13 08:40:35', NULL),
(62, 'bk2l1va4pf', '59', '翁佳玲', '0953222333', '內湖', '2024-11-13 08:45:40', '2024-11-13 08:45:40', NULL),
(63, 'bk2l1va4pf', '60', '駱建成', '0954333444', '南港', '2024-11-13 08:50:45', '2024-11-13 08:50:45', NULL),
(64, 'bk2l1va4pf', '61', '高雅芳', '0955444555', '文山', '2024-11-13 08:55:50', '2024-11-13 08:55:50', NULL),
(65, 'bk2l1va4pf', '62', '傅志豪', '0956555666', '中山', '2024-11-13 09:00:55', '2024-11-13 09:00:55', NULL),
(66, 'bk2l1va4pf', '63', '田雅玲', '0957666777', '信義', '2024-11-13 09:05:00', '2024-11-13 09:05:00', NULL),
(67, 'bk2l1va4pf', '64', '康建國', '0958777888', '大安', '2024-11-13 09:10:05', '2024-11-13 09:10:05', NULL),
(68, 'bk2l1va4pf', '65', '古美珍', '0959888999', '中正', '2024-11-13 09:15:10', '2024-11-13 09:15:10', NULL),
(69, 'bk2l1va4pf', '66', '唐志偉', '0960999000', '萬華', '2024-11-13 09:20:15', '2024-11-13 09:20:15', NULL),
(70, 'bk2l1va4pf', '67', '藍雅琪', '0961000111', '大同', '2024-11-13 09:25:20', '2024-11-13 09:25:20', NULL),
(71, 'bk2l1va4pf', '68', '邵建志', '0962111222', '士林', '2024-11-13 09:30:25', '2024-11-13 09:30:25', NULL),
(72, 'bk2l1va4pf', '69', '白惠美', '0963222333', '北投', '2024-11-13 09:35:30', '2024-11-13 09:35:30', NULL),
(73, 'bk2l1va4pf', '70', '方志遠', '0964333444', '內湖', '2024-11-13 09:40:35', '2024-11-13 09:40:35', NULL),
(74, 'bk2l1va4pf', '71', '龔雅文', '0965444555', '南港', '2024-11-13 09:45:40', '2024-11-13 09:45:40', NULL),
(75, 'bk2l1va4pf', '72', '韓建安', '0966555666', '文山', '2024-11-13 09:50:45', '2024-11-13 09:50:45', NULL),
(76, 'bk2l1va4pf', '73', '嚴美玲', '0967666777', '中山', '2024-11-13 09:55:50', '2024-11-13 09:55:50', NULL),
(77, 'bk2l1va4pf', '74', '金志明', '0968777888', '信義', '2024-11-13 10:00:55', '2024-11-13 10:00:55', NULL),
(78, 'bk2l1va4pf', '75', '范雅婷', '0969888999', '大安', '2024-11-13 10:05:00', '2024-11-13 10:05:00', NULL),
(79, 'bk2l1va4pf', '76', '石建龍', '0970999000', '中正', '2024-11-13 10:10:05', '2024-11-13 10:10:05', NULL),
(80, 'bk2l1va4pf', '77', '龍雅琳', '0971000111', '萬華', '2024-11-13 10:15:10', '2024-11-13 10:15:10', NULL),
(81, 'bk2l1va4pf', '78', '葉志豪', '0972111222', '大同', '2024-11-13 10:20:15', '2024-11-13 10:20:15', NULL),
(82, 'bk2l1va4pf', '79', '董佳蓉', '0973222333', '士林', '2024-11-13 10:25:20', '2024-11-13 10:25:20', NULL),
(83, 'bk2l1va4pf', '80', '戴建文', '0974333444', '北投', '2024-11-13 10:30:25', '2024-11-13 10:30:25', NULL),
(84, 'bk2l1va4pf', '81', '宋雅芳', '0975444555', '內湖', '2024-11-13 10:35:30', '2024-11-13 10:35:30', NULL),
(85, 'bk2l1va4pf', '82', '方志豪', '0976555666', '南港', '2024-11-13 10:40:35', '2024-11-13 10:40:35', NULL),
(86, 'bk2l1va4pf', '83', '賴美玲', '0977666777', '文山', '2024-11-13 10:45:40', '2024-11-13 10:45:40', NULL),
(87, 'bk2l1va4pf', '84', '史建安', '0978777888', '中山', '2024-11-13 10:50:45', '2024-11-13 10:50:45', NULL),
(88, 'bk2l1va4pf', '85', '傅雅惠', '0979888999', '信義', '2024-11-13 10:55:50', '2024-11-13 10:55:50', NULL),
(89, 'bk2l1va4pf', '86', '巫志偉', '0980999000', '大安', '2024-11-13 11:00:55', '2024-11-13 11:00:55', NULL),
(90, 'bk2l1va4pf', '87', '連佳玲', '0981000111', '中正', '2024-11-13 11:05:00', '2024-11-13 11:05:00', NULL),
(91, 'bk2l1va4pf', '88', '馬建國', '0982111222', '萬華', '2024-11-13 11:10:05', '2024-11-13 11:10:05', NULL),
(92, 'bk2l1va4pf', '89', '梁雅琪', '0983222333', '大同', '2024-11-13 11:15:10', '2024-11-13 11:15:10', NULL),
(93, 'bk2l1va4pf', '90', '温志明', '0984333444', '士林', '2024-11-13 11:20:15', '2024-11-13 11:20:15', NULL),
(94, 'bk2l1va4pf', '91', '石美玲', '0985444555', '北投', '2024-11-13 11:25:20', '2024-11-13 11:25:20', NULL),
(95, 'bk2l1va4pf', '92', '馮建華', '0986555666', '內湖', '2024-11-13 11:30:25', '2024-11-13 11:30:25', NULL),
(96, 'bk2l1va4pf', '93', '童雅文', '0987666777', '南港', '2024-11-13 11:35:30', '2024-11-13 11:35:30', NULL),
(97, 'bk2l1va4pf', '94', '邱志豪', '0988777888', '文山', '2024-11-13 11:40:35', '2024-11-13 11:40:35', NULL),
(98, 'bk2l1va4pf', '95', '柯佳蓉', '0989888999', '中山', '2024-11-13 11:45:40', '2024-11-13 11:45:40', NULL),
(99, 'bk2l1va4pf', '96', '洪建志', '0990999000', '信義', '2024-11-13 11:50:45', '2024-11-13 11:50:45', NULL),
(100, 'bk2l1va4pf', '97', '孫雅婷', '0991000111', '大安', '2024-11-13 11:55:50', '2024-11-13 11:55:50', NULL),
(101, 'bk2l1va4pf', '98', '趙志偉', '0992111222', '中正', '2024-11-13 12:00:55', '2024-11-13 12:00:55', NULL),
(102, 'bk2l1va4pf', '99', '鄭美珍', '0993222333', '萬華', '2024-11-13 12:05:00', '2024-11-13 12:05:00', NULL),
(103, 'bk2l1va4pf', '100', '謝建安', '0994333444', '大同', '2024-11-13 12:10:05', '2024-11-13 12:10:05', NULL),
(104, 'bk2l1va4pf', '101', '韓雅琳', '0995444555', '士林', '2024-11-13 12:15:10', '2024-11-13 12:15:10', NULL),
(105, 'bk2l1va4pf', '102', '楊小華', '0977888999', '松山', '2024-11-13 12:50:00', '2024-11-13 12:50:00', NULL),
(106, 'bk2l1va4pf', '103', '陳大明', '0978999000', '信義', '2024-11-13 12:55:00', '2024-11-13 12:55:00', NULL),
(107, 'bk2l1va4pf', '104', '李小龍', '0979000111', '中正', '2024-11-13 13:00:00', '2024-11-13 13:00:00', NULL),
(108, 'bk2l1va4pf', '105', '楊志偉', '0912012345', '大安', '2024-11-13 13:05:10', '2024-11-13 13:05:10', NULL),
(109, 'bk2l1va4pf', '106', '謝雅芳', '0923123456', '中正', '2024-11-13 13:10:20', '2024-11-13 13:10:20', NULL),
(110, 'bk2l1va4pf', '107', '鄭家豪', '0934234567', '萬華', '2024-11-13 13:15:30', '2024-11-13 13:15:30', NULL),
(111, 'bk2l1va4pf', '108', '許家榮', '0945345678', '大安', '2024-11-13 13:20:40', '2024-11-13 13:20:40', NULL),
(112, 'bk2l1va4pf', '109', '郭雅琪', '0956456789', '信義', '2024-11-13 13:25:50', '2024-11-13 13:25:50', NULL),
(113, 'bk2l1va4pf', '110', '林志明', '0967567890', '中山', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(114, 'bk2l1va4pf', '111', '陳美華', '0978678901', '松山', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(115, 'bk2l1va4pf', '112', '王建國', '0989789012', '中正', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(116, 'bk2l1va4pf', '113', '李小芳', '0990890123', '萬華', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL),
(117, 'bk2l1va4pf', '114', '張志豪', '0911123456', '大同', '2024-11-13 13:50:00', '2024-11-13 13:50:00', NULL),
(118, 'bk2l1va4pf', '115', '劉靜怡', '0922234567', '士林', '2024-11-13 13:55:10', '2024-11-13 13:55:10', NULL),
(119, 'bk2l1va4pf', '116', '吳大維', '0933345678', '北投', '2024-11-13 14:00:20', '2024-11-13 14:00:20', NULL),
(120, 'bk2l1va4pf', '117', '黃麗華', '0944456789', '內湖', '2024-11-13 14:05:30', '2024-11-13 14:05:30', NULL);

```