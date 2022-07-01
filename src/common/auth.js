
const tokenKey = 'token'
const refreshTokenKey = 'refreshToken'
const userInfoKey = 'WMS-userinfo'
import store from '@/store'

// 获取token值
function getUserToken(){
	return uni.getStorageSync(tokenKey);
}

function setUserToken(token){
	uni.setStorageSync(tokenKey,token);
}

function removeUserToken(){
	uni.removeStorageSync(tokenKey);
}

// 获取refresh token值
function getRefreshToken(){
	return uni.getStorageSync(refreshTokenKey);
}

function setRefreshToken(token){
	uni.setStorageSync(refreshTokenKey,token);
}

function removeRefreshToken(){
	uni.removeStorageSync(refreshTokenKey);
}

// 获取用户信息
function getUserInfo(){
	return uni.getStorageSync(userInfoKey);
}

function setUserInfo(userinfo){
	uni.setStorageSync(userInfoKey,userinfo);
}

function removeUserInfo(){
	uni.removeStorageSync(userInfoKey);
}

function checkLogin (flag) {
	if (!getUserToken()) {
		uni.showModal({
			title: '未登录',
			content: '您未登录，需要登录后才能继续',
			/**
			 * 如果需要强制登录，不显示取消按钮
			 */
			showCancel: store.state.user.forcedLogin,
			success: (res) => {
				if (res.confirm) {
					/**
					 * 如果需要强制登录，使用reLaunch方式
					 */
					if (store.state.user.forcedLogin) {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					} else {
						uni.navigateTo({
							url: '/pages/login/login'
						});
					}
				}else if (res.cancel) {
					uni.redirectTo({
						url: '/pages/login/login'
					});
				}
			}
		});
	}else {
		//如果该用户没有获取基础用户信息强制跳转获取用户信息
		if(store.state.user.userInfo.nickName === ""||store.state.user.userInfo.nickName === null){
			uni.navigateTo({
				url: '/pages/login/login'
			});
		}else if(flag===1){
			uni.switchTab({
				url: '/pages/home/home',
			});
		}
	}
}

export {
	getUserToken,
	setUserToken,
	removeUserToken,

	getRefreshToken,
	setRefreshToken,
	removeRefreshToken,

	getUserInfo,
	setUserInfo,
	removeUserInfo,

	checkLogin
}
