<template>
	<div class="address_container_content">
		<div class="address_content_wrap">
			<div class="address_content_title">
	          <div class="address_content_title_first">{{`${$t('ExplorerLang.addressDetail.addressDetail')} |`}}</div>
	          <div class="address_content_title_address">{{address}}</div>
	      	</div>
			<div class="address_asset_content" v-show="moduleSupport('103', prodConfig.navFuncList)">
				<div class="content_title">{{$t('ExplorerLang.addressDetail.assets')}}</div>
				<el-table class="table" :data="assetArray" :empty-text="$t('ExplorerLang.table.emptyDescription')">
					<el-table-column :min-width="ColumnMinWidth.denom" :label="$t('ExplorerLang.table.denom')"  prop="denomName"></el-table-column>
					<el-table-column :min-width="ColumnMinWidth.tokenId" :label="$t('ExplorerLang.table.id')" >
						<template slot-scope="scope">
							<router-link :to="`/nft/token?denom=${scope.row.denomId}&&tokenId=${scope.row.id}`">{{scope.row.nftName || formatAddress(scope.row.id)}}</router-link>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.schema" :label="$t('ExplorerLang.table.data')" prop="tokenData"></el-table-column>
					<el-table-column :min-width="ColumnMinWidth.URI" :label="$t('ExplorerLang.table.uri')" prop="tokenUri">
						<template slot-scope="scope">
							<a v-if="scope.row.tokenUri" :download="scope.row.tokenUri" :href="scope.row.tokenUri" target="_blank">{{scope.row.tokenUri}}</a>
							<span v-else>--</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="consumer_transaction_content" v-show="moduleSupport('105', prodConfig.navFuncList)">
				<div class="content_title">{{$t('ExplorerLang.addressDetail.consumerTitle')}}</div>
				<el-table class="table" :data="consumerTxList"
						  row-key="txHash"
                          :empty-text="$t('ExplorerLang.table.emptyDescription')"
						  :span-method="arraySpanMethod"
    					  >
					<el-table-column :min-width="ColumnMinWidth.serviceName" :label="$t('ExplorerLang.table.serviceName')">
						<template slot-scope="scope">
							<el-tooltip v-if="!scope.row.isChildren"  :content="scope.row.serviceName" placement="top">
								<router-link :to="`/service?serviceName=${scope.row.serviceName}`">{{scope.row.serviceName}}</router-link>
							</el-tooltip>
							<span v-if="scope.row.isChildren && scope.row.index==0">{{getRespondCount(scope.row.count)}}</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.txType" :label="$t('ExplorerLang.table.txType')" prop="txType"></el-table-column>
					<el-table-column :min-width="ColumnMinWidth.state" :label="$t('ExplorerLang.table.requestStatus')">
						<template slot-scope="scope">
							<div v-if="scope.row.state" class="consumer_transaction_content_available">
								<span class="consumer_transaction_content_available_icon" :style="`background:${getBgColorWithState(scope.row.state)}`"></span>
								<span>{{scope.row.state}}</span>
							</div>
							<div v-else>--</div>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.blockHeight" :label="$t('ExplorerLang.table.block')">
						<template slot-scope="scope">
							<router-link :to="`/block/${scope.row.blockHeight}`">{{scope.row.blockHeight}}</router-link>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.txHash" :label="$t('ExplorerLang.table.txHash')">
						<template slot-scope="scope">
							<div class="address_transaction_content_hash">
								<img class="status_icon"
                                             :src="require(`../assets/${scope.row.status==TX_STATUS.success?'success.png':'failed.png'}`)"/>
								<el-tooltip :content="scope.row.txHash"
								            placement="top">
									<router-link :to="`/tx?txHash=${scope.row.txHash}`">{{formatTxHash(scope.row.txHash)}}</router-link>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.requestId" :label="$t('ExplorerLang.table.requestId')">
                        <template slot-scope="scope">
                            <span>{{formatAddress(scope.row.requestContextId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :min-width="ColumnMinWidth.address" :label="$t('ExplorerLang.table.provider')">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.txType==TX_TYPE.respond_service" 
								        :content="scope.row.provider"
								        placement="top">
								<router-link   :to="`/address/${scope.row.provider}`">
                                	{{formatAddress(scope.row.provider)}}
                            	</router-link>
							</el-tooltip>
                            <div v-if="scope.row.txType==TX_TYPE.call_service">
                                    <el-tooltip v-if="(scope.row.provider || []).length === 1"
								            	:content="scope.row.provider[0]"
								            	placement="top">
						            	<router-link :to="`/address/${scope.row.provider[0]}`">
                                        	{{formatAddress(scope.row.provider[0])}}
                                    	</router-link>
									</el-tooltip>
                                <div class="service_tx_muti_to_container"
                                     v-else>
                                    <router-link :to="`/tx?txHash=${scope.row.txHash}`">
                                        {{ `${scope.row.provider.length} ${$t('ExplorerLang.unit.providers')}` }} 
                                    </router-link>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :min-width="ColumnMinWidth.time" :label="$t('ExplorerLang.table.timestamp')">
						<template slot-scope="scope">
							<span>{{`${scope.row.time}`}}</span>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination_content" v-show="consumerTxCount > consumerTxPageSize">
					<m-pagination :page-size="consumerTxPageSize"
					              :total="consumerTxCount"
					              :page="consumerTxPageNum"
					              :page-change="consumerTxPageChange">
					</m-pagination>
				</div>
			</div>
			<div class="provider_transaction_content" v-show="moduleSupport('105', prodConfig.navFuncList)">
				<div class="content_title">{{$t('ExplorerLang.addressDetail.providerTitle')}}</div>
				<el-table class="table" :data="providerTxList" :empty-text="$t('ExplorerLang.table.emptyDescription')">
					<el-table-column :min-width="ColumnMinWidth.serviceName" :label="$t('ExplorerLang.table.serviceName')">
						<template slot-scope="scope">
							<el-tooltip :content="scope.row.serviceName" placement="top">
								<router-link :to="`/service?serviceName=${scope.row.serviceName}`">{{scope.row.serviceName}}</router-link>
							</el-tooltip>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.respondTimes" :label="$t('ExplorerLang.table.respondTimes')">
						<template slot-scope="scope">
							<router-link :to="`/service/respond/${scope.row.serviceName}/${address}`">{{`${scope.row.respond_times} ${$t('ExplorerLang.unit.time')}`}}</router-link>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.available" :label="$t('ExplorerLang.table.isAvailable')">
						<template slot-scope="scope">
							<div class="provider_transaction_content_available">
								<span class="provider_transaction_content_available_icon" :style="`background:${scope.row.isAvailable?'#B1E96E':'#C4C4C4'}`"></span>
								<span class="provider_transaction_content_available_status">{{scope.row.isAvailable?"True":'False'}}</span>
							</div>
						</template>
					</el-table-column>
					<!-- <el-table-column :min-width="ColumnMinWidth.price" :label="$t('ExplorerLang.table.price')">
						<template slot-scope="scope">
							<span>{{scope.row.pricing}}</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.deposit" :label="$t('ExplorerLang.table.deposit')">
						<template slot-scope="scope">
							<span>{{scope.row.deposit}}</span>
						</template>
					</el-table-column> -->
					<el-table-column :min-width="ColumnMinWidth.qos" :label="$t('ExplorerLang.table.minBlock')">
						<template slot-scope="scope">
							<span>{{`${scope.row.qos} ${$t('ExplorerLang.unit.blocks')}`}}</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.time" :label="$t('ExplorerLang.table.bindTime')">
						<template slot-scope="scope">
							<span>{{`${scope.row.time}`}}</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.time" :label="$t('ExplorerLang.table.disabledTime')">
						<template slot-scope="scope">
							<span>{{scope.row.isAvailable ? '--' : scope.row.unbindTime}}</span>
						</template>
					</el-table-column>
				</el-table>
				<div class="content_title" style="margin-top:0.4rem">{{$t('ExplorerLang.addressDetail.respondRecord')}}</div>
				<el-table class="table" :data="respondRecordList" :empty-text="$t('ExplorerLang.table.emptyDescription')">
					<el-table-column :min-width="ColumnMinWidth.serviceName" :label="$t('ExplorerLang.table.serviceName')">
						<template slot-scope="scope">
							<el-tooltip v-if="scope.row.serviceName" :content="scope.row.serviceName" placement="top">
								<router-link :to="`/service?serviceName=${scope.row.serviceName}`">{{scope.row.serviceName}}</router-link>
							</el-tooltip>
							<span v-if="!scope.row.serviceName">--</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.txType" :label="$t('ExplorerLang.table.txType')" prop="type"></el-table-column>
					<el-table-column :min-width="ColumnMinWidth.txHash" :label="$t('ExplorerLang.table.respondHash')">
						<template slot-scope="scope">
							<div class="respond_transaction_content_hash">
								<img class="status_icon"
                                             :src="require(`../assets/${scope.row.respondStatus==TX_STATUS.success?'success.png':'failed.png'}`)"/>
								<el-tooltip :content="scope.row.respondHash"
								            placement="top">
									<router-link :to="`/tx?txHash=${scope.row.respondHash}`">{{formatTxHash(scope.row.respondHash)}}</router-link>
								</el-tooltip>
							</div>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.requestId" :label="$t('ExplorerLang.table.requestId')">
                        <template slot-scope="scope">
                            <span>{{formatAddress(scope.row.requestContextId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :min-width="ColumnMinWidth.blockHeight" :label="$t('ExplorerLang.table.block')">
						<template slot-scope="scope">
							<router-link :to="`/block/${scope.row.blockHeight}`">{{scope.row.height}}</router-link>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.time" :label="$t('ExplorerLang.table.timestamp')" prop="time">
						<template slot-scope="scope">
							<span>{{Tools.getDisplayDate(scope.row.time)}}</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.address" :label="$t('ExplorerLang.table.consumer')">
						<template slot-scope="scope">
							<el-tooltip :content="scope.row.consumer" placement="top">
								<router-link  v-if="scope.row.consumer && scope.row.consumer.length" :to="`/address/${scope.row.consumer}`">{{formatAddress(scope.row.consumer)}}</router-link>
							</el-tooltip>
							<span v-if="!scope.row.consumer">--</span>
						</template>
					</el-table-column>
					<el-table-column :min-width="ColumnMinWidth.txHash" :label="$t('ExplorerLang.table.requestHash')">
						<template slot-scope="scope">
							<div class="address_transaction_content_hash">
								<img v-if="scope.row.requestHash && scope.row.requestHash !='--'" class="status_icon"
                                            src="../assets/success.png"/>
								<el-tooltip v-if="scope.row.requestHash && scope.row.requestHash != '--'" 
								            :content="scope.row.requestHash"
								            placement="top">
									<router-link :to="`/tx?txHash=${scope.row.requestHash}`">{{formatTxHash(scope.row.requestHash)}}</router-link>
								</el-tooltip>
								<span v-else>{{'--'}}</span>
							</div>
						</template>
					</el-table-column>
				</el-table>
				<div class="pagination_content" v-show="respondRecordCount > respondRecordPageSize">
					<m-pagination :page-size="respondRecordPageSize"
					              :total="respondRecordCount"
					              :page="respondRecordPageNum"
					              :page-change="respondRecordPageChange">
					</m-pagination>
				</div>
			</div>
			<div class="address_transaction_content">
				<div class="content_title">{{$t('ExplorerLang.addressDetail.txRecord')}}</div>
				<div class="address_transaction_condition_container">
                    <span class="address_transaction_condition_count">
                        {{ `${totalTxNumber} ${$t('ExplorerLang.unit.Txs')}` }}
                    </span>
                    <el-select v-model="type_temp">
                        <el-option v-for="(item, index) in txTypeOption"
                                   :key="index"
                                   :label="item.label"
                                   :value="item.value"></el-option>
                    </el-select>
                    <el-select v-model="status_temp">
                        <el-option v-for="(item, index) in statusOpt"
                                   :key="index"
                                   :label="item.label"
                                   :value="item.value"></el-option>
                    </el-select>
                    <div class="address_transaction_condition_action">
                    	<div class="search_btn" @click="handleSearchClick">
	                        {{$t('ExplorerLang.transactions.search')}}
	                    </div>
	                    <div class="reset_btn" @click="resetFilterCondition"><i class="iconfont iconzhongzhi"></i></div>
                    </div>
                </div>
				<TxListComponent :txData="txList"></TxListComponent>
				<div class="pagination_content" v-show="totalTxNumber > pageSize">
					<m-pagination :page-size="pageSize"
					              :total="totalTxNumber"
					              :page="pageNum"
					              :page-change="pageChange">
					</m-pagination>
				</div>
			</div>
			
		</div>
	</div>

</template>

<script>
	import { getNfts } from "../service/api";
	import Tools from "../util/Tools";
	import MPagination from "./common/MPagination";
	import { TxHelper } from "../helper/TxHelper";
	import { moduleSupport } from "../helper/ModulesHelper";
	import TxListComponent from "./common/TxListComponent";
	import prodConfig from "../productionConfig"
	import { TX_TYPE, TX_STATUS, ColumnMinWidth } from '../constant';
  	import {
  		getAddressTxList,
    	getCallServiceWithAddress,
		getRespondServiceWithAddress,
		getRespondServiceRecord,
		getServiceBindingByServiceName,
		getServiceContextsByServiceName,
		getAllTxTypes} from "../service/api";

    export default {
		name: "OwnerDetail",
		components: { MPagination, TxListComponent },
		data() {
			return{
				TX_TYPE,
				TX_STATUS,
				ColumnMinWidth,
				prodConfig,
				moduleSupport,
				Tools,
				assetArray:[],
				denomArray:[],
				address:'',
				pageNum: 1,
				pageSize: 10,
				txList:[],
				totalTxNumber:0,
				providerTxList:[],
				consumerTxPageNum:1,
				consumerTxPageSize: 5,
				consumerTxCount:0,
				consumerTxList:[],
				respondRecordList:[],
				respondRecordPageNum:1,
				respondRecordPageSize: 5,
				respondRecordCount:0,
				type:'',
                status:'',
                type_temp:'',
                status_temp:'',
                statusOpt : [
                    {
                        value : '',
                        label : this.$t('ExplorerLang.common.allTxStatus')
                    },
                    {
                        value : 1,
                        label : this.$t('ExplorerLang.common.success')
                    },
                    {
                        value : 2,
                        label : this.$t('ExplorerLang.common.failed')
                    }
                ],
                txTypeOption : [
                    {
                        value : '',
                        label : this.$t('ExplorerLang.common.allTxType')
                    },
                ],
			}
		},
		watch:{
			$route(){
				this.address = this.$route.params.param;
				this.getOwnerDetail();
				this.getTxByAddress();
				this.getConsumerTxList();
				this.getRspondRecordList();
				this.getProviderTxList();
				
			}
		},
		mounted () {
			document.documentElement.scrollTop = 0;
			this.getOwnerDetail();
			this.getAllTxType();
			this.getTxByAddress();
			this.getConsumerTxList();
			this.getRspondRecordList();
			this.getProviderTxList();
			this.address = this.$route.params.param
		},
		methods:{
			async getOwnerDetail(){
				try {				
					let nftData = await getNfts('', '', this.$route.params.param, 1, 1000, true);
					console.log('----',nftData)
					if(nftData && nftData.data ){
						this.assetArray = nftData.data.map(item => {
							return{
								id: item.nft_id,
                                denomName:item.denom_name || item.denom_id,
                                denomId: item.denom_id,
                                nftName:item.nft_name,
								owner: item.owner,
								tokenData: item.tokenData,
								tokenUri: item.tokenUri,

							}
						})
					}
				}catch (e) {
					console.error(e)
				}
			},
			//地址相关交易记录
			async getTxByAddress(){
			    try {
                    const res = await getAddressTxList(this.$route.params.param, this.type, this.status, this.pageNum, this.pageSize);
                    if(res){
                        console.log('addressTx======:',res);
                        this.totalTxNumber = res.count;
                        this.txList = res.data;
                    }
                }catch (e) {
                	console.error(e);
                    this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }
			},
			pageChange(pageNum) {
				this.pageNum = pageNum;
				this.getTxByAddress()
			},
			//服务调用-消费者
			async getConsumerTxList(){
			    try {
                    const res = await getCallServiceWithAddress(this.$route.params.param, this.consumerTxPageNum, this.consumerTxPageSize, true);
                    if(res){
                        console.log('ConsumerTx======:',res);
                        this.consumerTxCount = res.count;
                        this.consumerTxList = [];
                        for (let item of res.data){
                            let result = {
                                serviceName:item.msgs[0].msg.service_name || '--',
								txHash: item.tx_hash,
								blockHeight: item.height,
								txType: item.type,
								provider:item.msgs[0].msg.providers,
								time: Tools.getDisplayDate(item.time),
								state:"Running",
								status:item.status,
								respond:[],
                            };
                            item.events.forEach((item)=>{
	                            (item.attributes || []).forEach((attr)=>{
	                                if (attr.key == 'request_context_id') {
	                                    result.requestContextId = attr.value;
	                                }
	                            });
	                        });
	                        let context = await getServiceContextsByServiceName(result.requestContextId || '');
	                        if (context && context.result && context.result.value) {
	                        	result.state = context.result.value.state;
	                        }
                            this.consumerTxList.push(result);
                            if (item.respond && item.respond.length) {
	                        	item.respond.forEach((r,index)=>{
	                        		let respondResult = {
	                        			index,
	                        			isChildren:true,
	                        			count:item.respond.length,
		                        		serviceName:(r.msgs[0].msg.ex || {}).service_name || '',
										txHash: r.tx_hash,
										blockHeight: r.height,
										txType: r.type,
										provider:r.msgs[0].msg.provider,
										time: Tools.getDisplayDate(r.time),
										requestContextId:(r.msgs[0].msg.ex || {}).request_context_id,
										requestStatus:'--',
										status:r.status,
	                        		};
	                        		this.consumerTxList.push(respondResult);
	                        	});	 
	                        }
                        }
                    }
                }catch (e) {
                	console.error(e);
                    this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }

			},
			consumerTxPageChange(pageNum) {
				this.consumerTxPageNum = pageNum;
				this.getConsumerTxList()
			},
			//响应记录
			async getRspondRecordList(){
			    try {
                    const res = await getRespondServiceRecord('',this.$route.params.param, this.respondRecordPageNum, this.respondRecordPageSize);
                    if(res){
                        console.log('RspondRecordList======:',res);
                        this.respondRecordCount = res.count;
                        this.respondRecordList = res.data || [];
                    }
                }catch (e) {
                	console.error(e);
                    this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }

			},
			respondRecordPageChange(pageNum) {
				this.respondRecordPageNum = pageNum;
				this.getRspondRecordList()
			},
			//服务调用-提供者
			async getProviderTxList(){
			    try {
                    const res = await getRespondServiceWithAddress(this.$route.params.param, 1, 1000);
                    if(res){
                        console.log('ProviderTxList======:',res);
                        this.providerTxList = [];
                        for(let item of res.data){
                        	let result = {
                            	serviceName:(item.msgs[0].msg.ex || {}).service_name,
                            	provider:item.msgs[0].msg.provider,
                            	owner:item.msgs[0].msg.owner,
                                respond_times:item.respond_times,
                                pricing:JSON.parse(item.msgs[0].msg.pricing || '{}').price,
                                qos:item.msgs[0].msg.qos,
                                time: Tools.getDisplayDate(item.time),
                                unbindTime:item.unbinding_time ? Tools.getDisplayDate(item.unbinding_time) : '--',
                                txHash: item.tx_hash,
                                blockHeight: item.height,
                                txType: item.type,
                                status:item.status,
                            };
                            if (item.msgs[0].msg.deposit && item.msgs[0].msg.deposit.length) {
                                result.deposit = `${item.msgs[0].msg.deposit[0].amount} ${item.msgs[0].msg.deposit[0].denom}`;
                            }
                            let bindings = await getServiceBindingByServiceName(result.serviceName);
                            (bindings.result || []).forEach((bind)=>{
                                if(result.provider === bind.provider && result.owner == bind.owner){
                                    result.isAvailable = bind.available;
                                    result.pricing = JSON.parse(bind.pricing || '{}').price;
                                    result.qos = bind.qos;
                                    if (bind.disabled_time) {
                                    	let time = new Date(bind.disabled_time).getTime();
                                    	result.unbindTime = time>0 ? Tools.getDisplayDate(time/1000) : '--';
                                    }
                                }
                            })
                            if (result.pricing && result.pricing.length) {
                            	result.pricing = result.pricing.replace('point',' point');
                            }
                            this.providerTxList.push(result);
                        }
                    }
                }catch (e) {
                	console.error(e);
                    this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }

			},
			formatTxHash(TxHash){
				if(TxHash){
					return Tools.formatTxHash(TxHash)
				}else{
					return '--';
				}
			},
			formatAddress(address){
				return Tools.formatValidatorAddress(address) || '--';
			},
			getCallProviders(providers){
                if (providers && providers.length>2) {
                    return providers.slice(0, 2);
                }
                return providers;
            },
            getBgColorWithState(state){
            	let bgColor = '';
            	switch(state){
            		case 'running': bgColor = '#B1E96E'; break;
            		case 'completed': bgColor = '#FFC456'; break;
            		case 'paused': bgColor = '#E96E6E'; break;
            	}
            	return bgColor;
            },
            arraySpanMethod(table){
            	if (table.columnIndex === 0) {
            		if (table.row.isChildren) {
			          	if (table.row.index==0) {
			          		return {
				              rowspan: table.row.count,
				              colspan: 1
				            };
			          	}else{
			          		return {
				              rowspan: 0,
				              colspan: 0
				            };
			          	}
			        }else{
			          	return {
			              rowspan: 1,
			              colspan: 1
			            };
			        }
		        }

            },
            getRespondCount(count){
            	return this.$t('ExplorerLang.unit.totalRespond').replace(/\$\{\%value\%\}/, count);
            },
            handleSearchClick(){
            	this.type = this.type_temp;
            	this.status = this.status_temp;
                this.pageNum = 1;
                this.getTxByAddress();
            },
            resetFilterCondition(){
                this.type = '';
				this.status = '';
                this.pageNum = 1;
                this.getTxByAddress();
            },
            async getAllTxType(){
                try {
                    const res = await getAllTxTypes();
                    res.data.forEach((type) =>{
                        this.txTypeOption.push({
                            value : type.typeName,
                            item : type.typeName,
                        });
                    });
                } catch (e) {
                    console.error(e);
                    // this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }

            },
		}
	}
</script>

<style scoped lang="scss">
	a{
		color: $t_link_c !important;
	}
	.address_container_content{
		padding:0 0.15rem;
		.address_content_wrap{
			max-width: 12rem;
			margin: 0 auto;
			.address_content_title {
		        display: flex;
		        justify-content: flex-start;
		        color: $t_first_c;
		        font-size: $s18;
		        line-height: 0.21rem;
		        margin: 0.3rem 0 0.15rem 0.25rem;
		        text-align: left;
		        font-family:PingFangSC-Semibold,PingFang SC;
		        font-weight:600;
		        .address_content_title_first{
		            white-space: nowrap;
		            margin-right:0.05rem;
		        }
		        .address_content_title_address{
		            font-size: $s16;
		            font-family:ArialMT;
		            font-weight:400;
		            color: $t_first_c;
		            line-height:20px;
		            word-break: break-all;
		        }
		    }
			.address_asset_content{
				background: $bg_white_c;
				padding:0.25rem;
				border-radius:0.05rem;
				border:1px solid $bd_first_c;
			}

			.consumer_transaction_content{
				margin-top: 0.48rem;
				background: $bg_white_c;
				padding:0.25rem;
				border-radius:0.05rem;
				border:1px solid $bd_first_c;
				.consumer_transaction_content_hash{
					display: flex;
                    align-items: center;
				}
				.consumer_transaction_content_available{
					display: flex;
                    align-items: center;
                    .consumer_transaction_content_available_icon{
                    	width:0.1rem;
                    	height:0.1rem;
                    	border-radius:50%;
                    	margin-right:0.1rem;
                    }
				}
				.pagination_content{
					margin: 0.2rem 0 0.2rem 0;
					display: flex;
					justify-content: flex-end;
				}
			}
			.provider_transaction_content{
				margin-top: 0.48rem;
				background: $bg_white_c;
				padding:0.25rem;
				border-radius:0.05rem;
				border:1px solid $bd_first_c;
				.respond_transaction_content_hash{
					display: flex;
                    align-items: center;
				}
				.provider_transaction_content_available{
					display: flex;
                    align-items: center;
                    .provider_transaction_content_available_icon{
                    	width:0.1rem;
                    	height:0.1rem;
                    	border-radius:50%;
                    	margin-right:0.1rem;
                    }
				}
				.pagination_content{
					margin: 0.2rem 0 0.2rem 0;
					display: flex;
					justify-content: flex-end;
				}
			}

			.address_transaction_content{
				margin-top: 0.48rem;
				background: $bg_white_c;
				padding:0.25rem;
				border-radius:0.05rem;
				border:1px solid $bd_first_c;
				.address_transaction_content_hash{
					display: flex;
                    align-items: center;
				}
				.address_transaction_condition_container {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    margin-bottom: 0.4rem;
                    align-items: center;
                    .address_transaction_condition_count {
                        font-size: $s14;
                        margin-right: 0.42rem;
                        font-weight: 600;

                    }
                    /deep/ .el-select {
                        width: 1.3rem;
                        margin-right: 0.22rem;
                        .el-input {
                            .el-input__inner {
                                padding-left: 0.07rem;
                                height: 0.32rem;
                                font-size: $s14 !important;
                                line-height: 0.32rem;
                                &::-webkit-input-placeholder {
                                    font-size: $s14 !important;
                                }
                            }
                            .el-input__inner:focus {
                                border-color: $theme_c !important;
                            }
                            .el-input__suffix {
                                .el-input__suffix-inner {
                                    .el-input__icon {
                                        line-height: 0.32rem;
                                    }
                                }
                            }
                        }
                        .is-focus {
                            .el-input__inner {
                                border-color: $theme_c !important;
                            }
                        }

                    }
                    .search_btn {
                        cursor: pointer;
                        background: $bg_button_c;
                        color: $t_button_c;
                        border-radius: 0.04rem;
                        padding: 0.05rem 0.18rem;
                        font-size: $s14;
                        line-height: 0.2rem;
                    }
                    .address_transaction_condition_action{
                    	display:flex;
                    	.reset_btn {
	                        background: $bg_button_c;
	                        color: $t_button_c;
	                        border-radius: 0.04rem;
	                        margin-left: 0.1rem;
	                        cursor: pointer;
	                        i {
	                            padding: 0.08rem;
	                            font-size: $s14;
	                            line-height: 1;
	                            display: inline-block;
	                        }
	                    }
                    }
                    
                }
                .pagination_content{
					margin: 0.2rem 0 0.2rem 0;
					display: flex;
					justify-content: flex-end;
				}
			}
			
			.content_title{
				color: $t_first_c;
				margin-bottom: 0.4rem;
				text-align: left;
				font-size: $s16;
				font-family:PingFangSC-Semibold,PingFang SC;
				font-weight:600;
				line-height:22px;
			}

			.status_icon{
                width:0.13rem;
                height:0.13rem;
                margin-right:0.05rem;
            }
		}
	}

	@media screen and (max-width: 768px) {
		.address_container_content{
			.address_content_wrap{
				.address_content_title {
			        .address_content_title_first{
			        }
			        .address_content_title_address{
			        }
			    }
				.address_asset_content{
				}
				.consumer_transaction_content{
					.consumer_transaction_content_hash{
					}
					.consumer_transaction_content_available{
	                    .consumer_transaction_content_available_icon{
	                    }
					}
					.pagination_content{
					}
				}
				.provider_transaction_content{
					.respond_transaction_content_hash{
					}
					.provider_transaction_content_available{
	                    .provider_transaction_content_available_icon{
	                    }
					}
					.pagination_content{
					}
				}

				.address_transaction_content{
					.address_transaction_content_hash{
					}
					.address_transaction_condition_container {
						flex-direction:column;
                        align-items: flex-start;
	                    .address_transaction_condition_count {
	                    	margin-bottom:0.1rem;
	                    }
	                    /deep/ .el-select {
	                    	width: 100%;
                            margin-bottom: 0.1rem;
	                        .el-input {
	                            .el-input__inner {
	                            }
	                            .el-input__inner:focus {
	                            }
	                            .el-input__suffix {
	                                .el-input__suffix-inner {
	                                    .el-input__icon {
	                                    }
	                                }
	                            }
	                        }
	                        .is-focus {
	                            .el-input__inner {
	                            }
	                        }
	                    }
	                    .search_btn {
	                    }
	                    .reset_btn {
	                        i {
	                        }
	                    }
	                }
	                .pagination_content{
					}
				}
				.content_title{
				}
				.status_icon{
	            }
			}
		}
	}
</style>
