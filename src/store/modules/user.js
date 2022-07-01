import $http from "../../common/request"
import * as $auth from "../../common/auth"

const user = {
	state:{
		token:$auth.getUserToken() || null,
		userInfo: $auth.getUserInfo() || null, // 登录成功返回的个人信息
	},
	mutations:{
		// 登录的用户信息
		SET_USERINFO(state,userInfo){
			state.userInfo = userInfo;
			$auth.setUserInfo(userInfo);
		},
		SET_TOKEN: (state,token) => {
			state.token = token;
			$auth.setUserToken(token);
		},
		logout(state) {
			state.token = null;
			state.userInfo = null
			$auth.removeUserInfo()
			$auth.removeUserToken()
		},
		//显示请求加载动画
		request_show_loading(state) {
			state.requestLoading = true;
		},
		//隐藏请求加载动画
		request_hide_loading(state) {
			state.requestLoading = false;
		}
	},
	actions: {

	}
}

export default user
