import Vue from 'vue'
import App from './App'
import store from './store'
import request from './common/request.js'
import axios from 'axios'
import graceChecker from './common/graceChecker.js'
import jiuaiDebounce from './common/jiuai-debounce.js'


require('./mock')

Vue.prototype.$store = store
Vue.prototype.$http = request
Vue.prototype.axios = axios
Vue.prototype.graceChecker = graceChecker
Vue.prototype.$jiuaiDebounce = jiuaiDebounce


Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})
app.$mount()
