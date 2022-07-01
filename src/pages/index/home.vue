<template>
	<view class="home">
    <view class="title uni-flex">
      <text>{{data.name}}</text>
    </view>
    <view class="time uni-flex">
      <text>答题时间：</text>
      <text>{{data.minute}}分钟</text>
    </view>
    <view class="describe">
      <text>{{data.content}}</text>
    </view>
    <view class="form_box">
      <view class="same">
        <view class="name label">姓名</view>
        <input class="label_val" v-model="formData.name" placeholder="请输入姓名"/>
      </view>
      <view class="same">
        <view class="mobile label">手机号</view>
        <input class="label_val" type="number" v-model="formData.mobile" placeholder="请输入手机号"/>
      </view>
      <view class="btn_box">
        <button class="btn_submit" @click="submit">开始测试</button>
      </view>
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				data: {
				  name: '',
          minute: '',
          content: ''
        },
        formData:{
				  name: '',
          mobile: ''
        }
			}
		},
    onLoad(option){
      if(option.userInfoStr){
        this.formData = JSON.parse(decodeURIComponent(option.userInfoStr))
      }
    },
		mounted() {
      this.get_answer_kinds()
		},
		methods: {
      get_answer_kinds(){
        // this.$http.get('get_answer_kinds').then(res=>{
        //   console.log('11111')
        // })
        this.axios.get('http://localhost:8080/get_answer_kinds').then(res=>{
          if(res.data.code === 200){
            this.data = res.data.data
            console.log(this.data)
          }
        })
      },
      submit(){
        if (!this.formData.name){
          uni.showToast({
            icon: 'none',
            title: '你还未填写姓名!'
          })
          return
        }
        if (!this.formData.mobile){
          uni.showToast({
            icon: 'none',
            title: '你还未填写手机号码!'
          })
          return
        }
        if(!this.graceChecker.checkPhoneNum(this.formData.mobile)){
          uni.showToast({
            icon: 'none',
            title: '手机号码格式不正确!'
          })
          return
        }
        let userInfo = encodeURIComponent(JSON.stringify(this.formData))
        uni.reLaunch({
          url: `/pages/topic/index?formData=${userInfo}`
        })
      }
		}
	}
</script>

<style lang="scss">
	.home {
    padding: 0rpx 30rpx;
    background-color: $uni-bg-color-grey;
    .logo {
      height: 200rpx;
      width: 200rpx;
      margin: 200rpx auto 50rpx auto;
    }
    .title {
      padding: 40rpx 40rpx 10rpx;
      font-size: 36rpx;
      font-weight: 600;
      color: #333333;
      text{
        line-height: 80rpx;
      }
    }
    .time{
      padding: 0rpx 40rpx 30rpx;
      font-weight: 400;
      color: #333333;
      text:nth-child(2){
        color: rgb(173, 54, 65);
      }
    }
    .describe{
      font-weight: 400;
      color: #333333;
    }
    .form_box{
      margin-top: 120rpx;
      .same{
        .label_val{
          height: 25px;
          padding: 7px 12px;
          line-height: 25px;
          font-size: 14px;
          background: #FFF;
          border: 2rpx solid #dfdfdf;
        }
        .label{
          padding: 20rpx 0;
        }
      }
      .btn_box{
        padding: 200rpx 0 120rpx;
        .btn_submit{
          width: 240rpx;
          height: 72rpx;
          background: #AD3641;
          font-weight: 600;
          color: #FFFFFF;
        }
      }
    }
	}
</style>
