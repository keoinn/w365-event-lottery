import request from '@/utils/requests/request.js'

export const getLotteryCandidates = (data) => {
  return request({
    url: '/utilite/get-lottery-candidates',
    method: 'POST',
    data
  })
}