<template>
  <view class="topic_page">
    <view class="time_box">
      <text>{{time}}</text>
    </view>
    <view class="topic_box">
      <view class="same" v-for="(item,index) in tempList" :key="index">
        <view class="indexes">{{index+1+((page.pageNo-1)*page.size)>9?'':'0'}}{{index+1+((page.pageNo-1)*page.size)}}</view>
        <view class="title">{{item.title}}</view>
        <view class="select">A: {{item.selecta}}</view>
        <view class="select">B: {{item.selectb}}</view>
        <view class="options_box">
          <text class="option_title">倾向A</text>
          <view class="option_same_box">
            <view class="option_same"
                  :class="{option_active:item.tempMitList[optionIndex].checked}"
                  v-for="(option,optionIndex) in item.tempMitList"
                  :key="optionIndex"
                  @click="changeOption(item.tempMitList,option,index)">
            </view>
          </view>
          <text class="option_title">倾向B</text>
        </view>
      </view>
    </view>
    <view class="button_box">
      <view class="btn1" v-if="page.hasNext" @click="nextPage">
        <text>下一步</text>
        <view class="icon"></view>
      </view>
      <view class="btn2" v-else @click="submit">
        <text>提交</text>
      </view>
    </view>
    <view class="progress_box">
      <view :style="{width:progressWidth}"></view>
    </view>
  </view>
</template>

<script>
export default {
  data(){
    return{
      userInfo:{},
      userInfoStr:'',
      answerTopicObj:{},
      topicListLen:0,
      time:"00:00:00",
      tempList:[],
      tempAnswerList:[],
      page:{
        pageNo:1,
        size:8,
        totalPage: 0,
        hasNext: true
      },
      mitList:[
        {name: 'A-5分 B-0分',value: '0',option: {A: 5,B: 0},checked:false},
        {name: 'A-4分 B-1分',value: '1',option: {A: 4,B: 1},checked:false},
        {name: 'A-2分 B-3分',value: '2',option: {A: 2,B: 3},checked:false},
        {name: 'A-1分 B-4分',value: '3',option: {A: 1,B: 4},checked:false},
        {name: 'A-0分 B-5分',value: '4',option: {A: 0,B: 5},checked:false}
      ],
      submitting: false,
      progressWidth: '0%'
    }
  },
  onLoad(option){
    this.userInfo = JSON.parse(decodeURIComponent(option.formData))
    this.userInfoStr = option.formData
  },
  mounted() {
    this.get_answer_topic()
  },
  methods:{
    get_answer_topic(){
      this.axios.get('http://localhost:8080/get_answer_topic').then(res=>{
        if(res.data.code === 200){
          res.data.data.answer.forEach(item=>{
            item.tempMitList = JSON.parse(JSON.stringify(this.mitList))
          })
          this.answerTopicObj = res.data.data
          this.topicListLen = res.data.data.answer.length

          this.tempList=this.answerTopicObj.answer.slice((this.page.pageNo-1)*this.page.size,this.page.pageNo*this.page.size)
          this.starTime(this.answerTopicObj.minute)

          this.page.totalPage = Math.ceil(this.topicListLen/this.page.size)
        }
      })
    },
    starTime(totalTime){
      this.timerId = setInterval(()=>{
        totalTime--
        if(totalTime < 0){
          clearInterval(this.timerId)
          uni.showToast({
            icon: 'none',
            title: '答题时间已结束'
          })
          setTimeout(()=>{
            this.jump(`/pages/index/home?userInfoStr=${this.userInfoStr}`)
          },2000)
        }

        // 得到剩余时间中的	时	分	秒
        let hour = Math.floor(totalTime/3600)
        let minute = Math.floor(totalTime%3600/60)
        let second = Math.floor(totalTime%60)

        this.time=`${Math.floor(hour/10)}${Math.floor(hour%10)}:${Math.floor(minute/10)}${Math.floor(minute%10)}:${Math.floor(second/10)}${Math.floor(second%10)}`
      },1000)
    },
    changeOption(tempMitList,option,topicIndex){
      tempMitList.forEach(item=>{
        item.checked = false
      })

      let activeOptionList=[]
      let index = Number(option.value)

      if(index === tempMitList.length-1){
        activeOptionList = tempMitList.slice(2)
      }else if(index > 2){
        activeOptionList = tempMitList.slice(2,index+1)
      }else if(index < 2){
        activeOptionList = tempMitList.slice(index,2+1)
      }else{
        activeOptionList = tempMitList.slice(2,2+1)
      }

      activeOptionList.forEach(item=>{
        item.checked = true
      })

      this.tempAnswerList[topicIndex+((this.page.pageNo-1)*this.page.size)] = {
        id: this.tempList[topicIndex].id,
        ptype: this.tempList[topicIndex].ptype,
        question: option.option,
      }

      let answerArr = this.tempAnswerList.filter(item=>{
        return item
      })
      this.progressWidth = Math.floor(answerArr.length/this.topicListLen*100)+'%'
      this.$forceUpdate()
    },
    nextPage(){
      if(this.tempAnswerList.length < 1){
        uni.showToast({
          title:'请填写题目',
          icon: "none"
        })
        return
      }
      for(let item of this.tempAnswerList){
        if(item === undefined || this.tempAnswerList.length !== this.page.pageNo*this.page.size) {
          uni.showToast({
            title:'还没有填写完题目',
            icon: "none"
          })
          return
        }
      }

      uni.pageScrollTo({
        scrollTop:0,
        duration:0
      })

      this.page.pageNo++
      this.tempList=this.answerTopicObj.answer.slice((this.page.pageNo-1)*this.page.size,this.page.pageNo*this.page.size)
      if(this.page.pageNo === this.page.totalPage){
        this.page.hasNext = false
      }
      console.log('this.page.pageNo',this.page.pageNo)
      console.log('this.tempList',this.tempList)
      console.log('this.tempAnswerList',this.tempAnswerList)

    },
    submit(){
      if (this.submitting) {
        return false;
      }
      for(let item of this.tempAnswerList){
        if(item === undefined || this.tempAnswerList.length !== this.topicListLen) {
          uni.showToast({
            title:'还没有填写完题目',
            icon: "none"
          })
          return
        }
      }
      this.submitting = true

      console.log('this.page.pageNo',this.page.pageNo)
      console.log('this.tempList',this.tempList)
      console.log('this.tempAnswerList',this.tempAnswerList)

      let param = {
        mobile: this.userInfo.mobile,
        name: this.userInfo.name,
        answers: this.tempAnswerList
      }

      // #ifdef H5
      uni.showLoading({
        title: '加载中',
        mask: true,
      })
      this.axios.post('http://muwarriors.12par.cn:5000/mbti/submit',param,{timeout: 5000}).then((res)=>{
        uni.hideLoading()
        if(res.data.success){
          clearInterval(this.timerId)
          // this.resultObj.score = res.data.emotion
          // this.resultObj.describe = res.data.describe
          let resultData = encodeURIComponent(JSON.stringify(res.data))
          this.jump(`/pages/result/result?userInfoStr=${this.userInfoStr}&resultData=${resultData}`)
          this.submitting = false;
        }
      }).catch((err)=>{
        uni.hideLoading()
        uni.showToast({
          title: err.message,
          icon:"none",
          mask: true
        })
        this.submitting = false;
      })
      // #endif

      // #ifndef H5
      this.$http.post('/mbti/submit',param).then(res=>{
        if(res.data.success){
          clearInterval(this.timerId)
          // this.resultObj.score = res.data.emotion
          // this.resultObj.describe = res.data.describe
          let resultData = encodeURIComponent(JSON.stringify(res.data))
          this.jump(`/pages/result/result?userInfoStr=${this.userInfoStr}&resultData=${resultData}`)
          this.submitting = false;
        }
      }).catch(err=>{
        this.submitting = false;
      })
      // #endif
    },
    jump(url){
      uni.reLaunch({
        url: url
      })
    }
  }
}
</script>

<style scoped lang="scss">
.topic_page{
  padding: 34rpx 34rpx 163rpx;
  .time_box{
    width: 680rpx;
    height: 46rpx;
    line-height: 46rpx;
    border-radius: 40rpx;
    margin: auto;
    background-color: #efefef;
    text-align: center;
    font-size: 28rpx;
    color: #2EBBEB;
  }
  .topic_box{
    margin-top: 177rpx;
    .same{
      color: #2EBBEB;
      text-align: center;
      margin-top: 152rpx;
      position: relative;
      .indexes{
        width: 55rpx;
        height: 55rpx;
        text-align: center;
        line-height: 55rpx;
        margin: 0 auto 60rpx;
        border-radius: 50%;
        color: white;
        background-color: #8fe01f;
      }
      .title{
        font-size: 35rpx;
      }
      .select{
        font-size: 27rpx;
        margin: 8rpx 0;
      }
      .options_box{
        display: flex;
        align-items: center;
        width: 575rpx;
        margin: 69rpx auto 0;
        .option_title{
          font-size: 27rpx;
        }
        .option_same_box{
          width: 366rpx;
          margin: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .option_same{
            width: 41rpx;
            height: 41rpx;
            border-radius: 50%;
            display: inline-block;
            border: 2rpx #2EBBEB solid;
          }
          .option_same:nth-child(3){
            width: 21rpx;
            height: 21rpx;
          }
          .option_same:nth-child(2),.option_same:nth-child(4){
            width: 31rpx;
            height: 31rpx;
          }
          .option_active{
            background-color: #2EBBEB;
          }
        }
      }
    }
    .same::after{
      content: '';
      width: 575rpx;
      height: 2rpx;
      background-color: #2EBBEB;
      opacity: 0.3;
      position: absolute;
      left: calc(50% - 575rpx/2);
      bottom: -75rpx;
      overflow: hidden;
    }
  }
  .button_box{
    padding: 244rpx 0 54rpx;
    .btn1,.btn2{
      width: 178rpx;
      height: 61rpx;
      border-radius: 61rpx;
      padding-left: 20rpx;
      margin: auto;
      background-color: #8fe01f;
      display: flex;
      justify-content: center;
      align-items: center;
      text{
        font-size: 37rpx;
        color: white;
      }
      .icon{
        width: 0;
        height: 0;
        margin-left: 15rpx;
        border: 10rpx solid;
        border-color: transparent transparent transparent white;
        position: relative;
      }
    }
    .btn2{
      padding-left: 0;
    }
  }
  .progress_box{
    width: 510rpx;
    height: 27rpx;
    border-radius: 27rpx;
    border: 3rpx #8fe01f solid;
    margin: auto;
    view{
      height: 100%;
      border-radius: 27rpx;
      background-color: #b0e962;
    }
  }
}
</style>