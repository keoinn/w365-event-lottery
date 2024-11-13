import axios from 'axios'
import { API_BASEURL, API_TIMEOUT } from '@/utils/sys_const.js'

const requestInstance = axios.create({
  baseURL: API_BASEURL,
  timeout: API_TIMEOUT
})

export default requestInstance