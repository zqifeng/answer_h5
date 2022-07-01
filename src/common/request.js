import * as $auth from "./auth"
import BASE_URL from './config.js'
import qs from 'qs'

function error(res){
	if (res.statusCode === 401) { // 超时自动刷新
		// uni.showToast({
		// 	title:"请刷新重新获取",
		// 	icon:"none"
		// })
	}else if (res.statusCode === 402|| res.statusCode === 403) {// 402 未登录或者refresh token过时， 403 账号在其他地方登录
		uni.showToast({
			title: res.data.msg,
			icon:"none",
			mask: true
		})
	}else if(res.statusCode === 404){
		uni.showToast({
			title:"404，路径找不到："+res.data.path,
			icon:"none"
		})
	}else if(res.statusCode === 504){
		uni.showToast({
			title:"网络连接错误",
			icon:"none"
		})
	}else{
		uni.showToast({
			title:res.errMsg,
			icon:"none"
		})
	}
}
function httpService(url,method,data,header,responseType){
	data = data || {};
	header = header || {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
	method = method || "GET";
	responseType = responseType || 'text'
	let token = $auth.getUserToken();
	if(token){
		header.token = token;			// 获取token值
	}
	if(method === 'POST'){
		// data = qs.stringify(data,  { allowDots: true, arrayFormat: 'indices' })
		data = JSON.stringify(data)
	}else if(method === 'GET' || method === 'DELETE'){
		 data = qs.stringify(data, { allowDots: true, arrayFormat: 'indices' })
		 data = qs.parse(data)
	}
	uni.showLoading({
		title: '加载中',
		mask: true,
	})
	return new Promise((resolve,reject)=>{
		uni.request({
			url: BASE_URL + url,
			header:header,
			data: data,
			method: method,
			responseType: responseType,
			timeout: 5000,
			success: res => {
				if(res.data && res.data.success === false){
					error(res);
				}
				resolve(res);
			},
			fail: (res) => {
				console.log('fail',res)
				error(res);
				reject(res);
			},
			complete: (res) => {
				console.log('complete',res)
				uni.hideLoading()
			}
		});
	})
}

// 单文件上传
function httpUpload(url, filePath,filename, formData,header,success,fail){
	let name = filename || 'file';
	header = header || {};
	let token = $auth.getUserToken();
	if(token){
		header.token = token;			// 获取token值
	}
	let promise = new Promise((resolve,reject)=>{
		uni.uploadFile({
			url: BASE_URL + url,
			filePath:filePath,
			name: 'file', 
			formData: formData || {},
			header:header,
			success: res => {
				resolve(JSON.parse(res.data));

			},
			fail: (res) => {
				uni.hideLoading();
				let err = JSON.parse(res);
				error(err);
				reject(err);
			},
			complete: () => {	
			}
		});
	})
	return promise;
}

function downloadFile(url,header,success,fail){
	header = header || {};
	let token = $auth.getUserToken();
	if(token){
		header.token = token;			// 获取token值
	}
	if(!url){
		return;
	}
	let downloadTask = uni.downloadFile({
		url: url,
		success: (res) => {
			if(res.statusCode===200){
				if(success){
					success.call(null,res);
				}
			}else{
				if(fail){
					fail.call(null,res);
				}
			}
		},
		fail:(res) => {
			let err = JSON.parse(res);
			error(err);
			if(fail){
				fail.call(null,err)
			}
		},
		complete: () => {
			
		}
	});
	return downloadTask;
}

export default {
	get:function(url,data,header,responseType){
		return httpService(url,'GET',data,header,responseType);
	},
	post:function(url,data,header,responseType){
		return httpService(url,'POST',data,header,responseType);
	},
	delete:function(url,data,header,responseType){
		return httpService(url,'DELETE',data,header,responseType);
	},
	put:function(url,data,header,responseType){
		return httpService(url,'PUT',data,header,responseType);
	},
	upload:function(url, filePath,filename, formData,header,success,fail){
		return httpUpload(url, filePath,filename, formData,header,success,fail)
	},
	download:function(url,header,success,fail){
		return downloadFile(url,header,success,fail);
	}
}