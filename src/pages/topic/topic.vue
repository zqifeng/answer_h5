<template>
  <view class="topic">
    <view class="swiper_box" v-if="!isResults">
      <swiper class="swiper"
              :current="swiperObj.current"
              :indicator-dots="swiperObj.indicatorDots"
              :autoplay="swiperObj.autoplay"
              :interval="swiperObj.interval"
              :duration="swiperObj.duration"
              :disable-touch="swiperObj.disableTouch"
              :style="swiperCss"
              @animationfinish="animationfinish">
        <swiper-item v-for="(item,index) in answerTopicObj.answer" :key="index" v-if="optionList[index] !== undefined || index === swiperObj.current || (optionList[swiperObj.current] !== undefined && index === swiperObj.current+1)">
          <view class="content">
            <!--题目-->
            <view class="topic_header_box">
              <view class="same">
                <text>{{index+1>9?'':'0'}}{{index+1}}/{{topicListLen}}</text>
                <text>{{item.title}}</text>
              </view>
              <view>
                <view class="same">A:{{item.selecta}}（ ）</view>
                <view class="same">B:{{item.selectb}}（ ）</view>
              </view>
              <view class="time">
                <text>答题时间：</text>
                <text>{{second}}秒</text>
              </view>
            </view>
            <!--选项-->
            <view class="topic_option_box">
              <view class="option_label">偏向A</view>
              <radio-group class="radio-group" @change="changeOption($event,index)">
                <label class="same uni-list-cell uni-list-cell-pd" v-for="(val,op_index) in mitList" :key="op_index">
                  <view>
                    <radio :value="val.value" :checked="optionList[index] === op_index" style="transform: scale(0.7);margin: 0"/>
                  </view>
<!--                  <view>{{val.name}}</view>-->
                </label>
              </radio-group>
              <view class="option_label">偏向B</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <view class="result_box" v-else>
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
  name: "topic",
  data(){
    return{
      userInfo:{},
      userInfoStr:'',
      answerTopicObj:{},
      second: 0,
      times: null,
      topicListLen: 0,
      swiperCss:{
        height: '600px'
      },
      mitList:[
        {name: 'A-5分 B-0分',value: '0',option: {A: 5,B: 0}},
        {name: 'A-4分 B-1分',value: '1',option: {A: 4,B: 1}},
        {name: 'A-2分 B-3分',value: '2',option: {A: 2,B: 3}},
        {name: 'A-1分 B-4分',value: '3',option: {A: 1,B: 4}},
        {name: 'A-0分 B-5分',value: '4',option: {A: 0,B: 5}}
      ],
      optionList: [], //选中的答案
      answerResults: [],
      isResults: false,

      resultObj:{
        score: '0',
        describe: ''
      },
      swiperObj:{
        current: 0,
        indicatorDots: false,
        autoplay: false,
        disableTouch: false,
        interval: 2000,
        duration: 500
      },
      submitting: false
    }
  },
  onLoad(option){
    this.userInfo = JSON.parse(decodeURIComponent(option.formData))
    this.userInfoStr = option.formData
  },
  mounted() {
    this.get_answer_topic()
    this.starTime()
  },
  methods:{
    get_answer_topic(){
      this.axios.get('http://localhost:8080/get_answer_topic').then(res=>{
        if(res.data.code === 200){
          this.answerTopicObj = res.data.data
          this.topicListLen = res.data.data.answer.length
          this.second = this.answerTopicObj.minute

          this.getNodeInfo()
        }
      })
    },
    getNodeInfo(){
      this.$nextTick(()=>{
        let view = uni.createSelectorQuery().in(this).selectAll(".content");
        view.fields({
          size: true
        },data=>{
          this.swiperCss.height = data[this.swiperObj.current].height+30+'px'
        }).exec()
      })
    },
    starTime(){
      this.times = setInterval(()=>{
        if(this.second !== 0){
          this.second--
        }else{
          clearInterval(this.times)
          uni.showToast({
            icon: 'none',
            title: '答题时间已结束'
          })
          setTimeout(()=>{
            this.answer_reset()
          },2000)
        }
      },1000)
    },
    changeOption(activeObj,index){
      if (this.submitting) {
        return false;
      }

      let activeOption = {}
      this.mitList.forEach((item,index)=>{
        if(item.value === activeObj.detail.value){
          activeOption = item.option
        }
      })
      this.answerResults[index] = {
        id: this.answerTopicObj.answer[index].id,
        ptype: this.answerTopicObj.answer[index].ptype,
        question: activeOption
      }
      this.optionList[index] = Number(activeObj.detail.value)
      if(this.swiperObj.current+1 !== this.topicListLen){
        this.swiperObj.current++
        this.getNodeInfo()
      }else{

        let param = {
          mobile: this.userInfo.mobile,
          name: this.userInfo.name,
          answers: this.answerResults
        }
        console.log('submit')

        // #ifdef H5
        uni.showLoading({
          title: '加载中',
          mask: true,
        })
        this.axios.post('http://muwarriors.12par.cn:5000/mbti/submit',param,{timeout: 5000}).then((res)=>{
          console.log('success',res)
          uni.hideLoading()
          if(res.data.success){
            this.isResults = true
            clearInterval(this.times)
            this.resultObj.score = res.data.emotion
            this.resultObj.describe = res.data.describe
            this.submitting = false;
          }
        }).catch((err)=>{
          console.log('err',err)
          uni.hideLoading()
          uni.showToast({
            title: err.message,
            icon:"none",
            mask: true
          })
          this.answerResults.pop()
          this.optionList.pop()
          this.submitting = false;
        })
        // #endif

        // #ifndef H5
        this.$http.post('/mbti/submit',param).then(res=>{
          if(res.data.success){
            console.log('success')
            this.isResults = true
            clearInterval(this.times)
            this.resultObj.score = res.data.emotion
            this.resultObj.describe = res.data.describe
            this.submitting = false;
          }
        }).catch(err=>{
          console.log('err')
          this.answerResults.pop()
          this.optionList.pop()
          this.submitting = false;
        })
        // #endif

        console.log('set submitting true');
        this.submitting = true;
      }
      this.$forceUpdate()
    },
    animationfinish(e){
      this.swiperObj.current = e.detail.current
      this.getNodeInfo()
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
.topic{
  padding: 20rpx 30rpx 0;
  .swiper{
    min-height: 100vh;
    .content{
      .topic_header_box{
        .same{
          margin: 20rpx 0;
        }
        .time{
          text:nth-child(2){
            color: rgb(173, 54, 65);
          }
        }
      }
      .topic_option_box{
        @include box;
        @include box_pack_between;
        @include box_align_center;
        .radio-group{
          @include box;
          @include box_pack_between;
          width: 56%;
          .same{
            @include box;
            @include box_align_center;
            margin: 30rpx 0;
          }
        }
      }
    }
  }
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