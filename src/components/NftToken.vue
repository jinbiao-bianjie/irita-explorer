<template>
	<div class="nft_token_container">
		<div class="nft_token_content_wrap">
			<div class="nft_token_title">{{$t('ExplorerLang.nftDetail.nftInformation')}}</div>
			<div class="nft_token_information_content">
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.owner')}}：</span>
					<span>
						<router-link :to="`/address/${owner}`">{{owner}}</router-link>
					</span>
				</div>
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.denom')}}：</span>
					<span>{{denomName || denomId}}</span>
				</div>
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.id')}}：</span>
					<span>{{nftName || tokenID}}</span>
				</div>
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.schema')}}：</span>
					<span>{{schema || '--'}}</span>
				</div>
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.data')}}：</span>
					<span>{{tokenData}}</span>
				</div>
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.creator')}}：</span>
					<span>{{creator}}</span>
				</div>
				
				
				
				<div class="nft_token_information_item">
					<span>{{$t('ExplorerLang.nftDetail.uri')}}：</span>
					<span v-if="tokenUri && tokenUri !== '--'">
						<a :href="tokenUri" target="_blank">{{tokenUri}}</a>
					</span>
					<span v-else>--</span>
				</div>
			</div>
			<div class="nft_token_list_content">
				<div class="nft_token_list_title"> {{$t('ExplorerLang.nftDetail.nftTxs')}}</div>
				<TxListComponent :txData="txListByToken"></TxListComponent>
                <div class="pagination_content">
                    <m-pagination :page-size="pageSize" :total="count" :page="pageNum" :page-change="pageChange"></m-pagination>
                </div>
			</div>
		</div>
	</div>
</template>

<script>
	import TxListComponent from "./common/TxListComponent";
	import { getNftDetail, getTokenTxList } from "../service/api"
	import Tools from "../util/Tools"
    import MPagination from "./common/MPagination";
    import { TX_TYPE,TX_STATUS } from '../constant';
	export default {
		name: "NftToken",
		components:{ MPagination, TxListComponent },
		data() {
			return {
				TX_TYPE,
				TX_STATUS,
				owner:'',
				Denom: '',
				TokenID: '',
				Uri:'',
				pageNum:1,
                count:0,
				pageSize: 10,
				txListByToken:[],
				creator:'',
				schema: '',
				name:'',
				tokenID:'',
				primaryKey:'',
				tokenData:'',
				tokenUri:'',
                denomName:'',
                nftName:'',
				denomId:''
			}
		},
		mounted () {
			this.getTokenInformation();
		},
		methods:{
			async getTokenInformation(){
				try {
					let nftDetail = await getNftDetail(this.$route.query.denom, this.$route.query.tokenId);
					console.log('----',nftDetail)

					if(nftDetail){
						this.creator = (nftDetail.denomDetail || {}).creator;
						this.schema = (nftDetail.denomDetail || {}).json_schema;
						this.name = nftDetail.denom;
						this.tokenID = nftDetail.nft_id;
						this.denomName = nftDetail.denom_name;
						this.denomId = nftDetail.denom_id;
						this.nftName = nftDetail.nft_name;
						// this.primaryKey = nftDetail.primary_key;
						this.owner = nftDetail.owner;
						this.tokenData = nftDetail.tokenData;
						this.tokenUri = nftDetail.tokenUri;
						
						this.getTokenTx()
					}
				}catch (e) {
					console.error(e)
				}
			},
            pageChange(pageNum){
			    this.pageNum = pageNum;
			    this.getTokenTx();
            },
			async getTokenTx(){
                const res = await getTokenTxList(this.tokenID,this.$route.query.denom,this.pageNum ,this.pageSize );
                try {
                    // console.log(res)
                    this.txListByToken = res.data;
                    this.count = res.count;
                    // console.log(this.txListByToken)
                }catch (e) {
                		console.error(e);
                    this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
                }
			},
			formatTxHash(TxHash){
				if(TxHash){
                    return Tools.formatTxHash(TxHash)
				}
			},
			formatAddress(address){
				return Tools.formatValidatorAddress(address)
			},
		}
	}
</script>

<style scoped lang="scss">
	a{
		color: $t_link_c !important;
	}
	.nft_token_container{
		padding:0 0.15rem;
		.nft_token_content_wrap{
			max-width: 12rem;
			margin: 0 auto;
			.nft_token_title{
				font-size: $s18;
				color: $t_first_c;
				font-weight: bold;
				margin: 0.3rem 0 0.1rem 0;
				text-align: left;
				text-indent: 0.2rem;
			}
			.nft_token_information_content{
				box-sizing: border-box;
				border: 0.01rem solid $bd_second_c;
				border-radius: 0.04rem;
				background: $bg_white_c;
				padding: 0.2rem;
				.nft_token_information_item{
					text-align: left;
					margin-bottom: 0.16rem;
					display: flex;
					span:nth-of-type(1){
						margin-right:0.15rem;
						min-width: 1.27rem;
						font-size: $s14;
						color: $t_second_c;
						line-height: 0.16rem;
					}
					span:nth-of-type(2){
						font-size: $s14;
						color: $t_first_c;
						flex: 1;
						word-break:break-all;
					}
				}
				.nft_token_information_item:last-child{
					margin-bottom: 0;
				}
			}
			.nft_token_list_content{
				.nft_token_list_title{
					font-size: $s18;
					color: $t_first_c;
					line-height: 0.21rem;
					font-weight: bold;
					text-align: left;
					text-indent: 0.2rem;
					margin: 0.3rem 0 0.1rem 0;
				}
        .pagination_content{
            display: flex;
            justify-content: flex-end;
            margin: 0.3rem 0 0.1rem 0;
        }
        .tx_transaction_content_hash{
            display: flex;
            align-items: center;
        }
			}
			.status_icon{
	        width:0.13rem;
	        height:0.13rem;
	        margin-right:0.05rem;
	    }
		}
	}

	@media screen and (max-width: 768px) {
        .nft_token_container{
			.nft_token_content_wrap{
				
				.nft_token_title{
				
				}
				.nft_token_information_content{
					
					.nft_token_information_item{
						
						span:nth-of-type(1){
							min-width: 1rem;
						}
						span:nth-of-type(2){
						
						}
					}
					.nft_token_information_item:last-child{
					
					}
				}
				.nft_token_list_content{
					.nft_token_list_title{
					
					}
	                .pagination_content{
	                
	                }
				}
				
			}
		}
    }
</style>
