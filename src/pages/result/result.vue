<template>
  <view class="result_page">
    <view class="result_box">
      <view class="score">
        <text>您的得分：</text>
        <text>{{resultObj.score}}</text>
      </view>
      <view class="evaluate_box" v-html="resultObj.describe"></view>
      <view class="btn_box">
        <button @click="answer_reset()">重新测试</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data(){
    return{
      userInfoStr:'',
      resultObj:{
        score: '0',
        describe: ''
      },
    }
  },
  onLoad(option){
    let resultData = JSON.parse(decodeURIComponent(option.resultData))
    this.userInfoStr = option.userInfoStr

    this.getResult(resultData)
  },
  methods:{
    getResult(resultData){
      this.resultObj = {
        score: resultData.emotion,
        describe: resultData.describe
      }
    },
    answer_reset(){
      uni.reLaunch({
        url: `/pages/index/home?userInfoStr=${this.userInfoStr}`
      })
    }
  }
}
</script>

<style scoped lang="scss">
.result_page{
  padding: 34rpx;
  .result_box{
    .score{
      text-align: center;
      margin: 30rpx auto;
      text:nth-child(2){
        color: rgb(173, 54, 65);
      }
    }
    .evaluate_box{
      white-space: pre-line;
    }
    .btn_box{
      @include box;
      @include box_pack_center;
      padding: 50rpx 0rpx;
      button{
        width: 375rpx;
        background-color: #AD3641;
        color: white;
      }
    }
  }
}
</style>