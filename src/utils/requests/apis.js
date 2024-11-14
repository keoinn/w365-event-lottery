import request from '@/utils/requests/request.js'

export const getLotteryCandidates = (data) => {
  return request({
    url: '/utilite/get-lottery-candidates',
    method: 'POST',
    data
  })
}

export const getLotteryTicketsNums= (data) => {
    return request({
      url: '/utilite/get-lottery-num',
      method: 'POST',
      data
  })
}

export const storeLotteryFinalResults = (data) => {
  return request({
    url: '/utilite/get-lottery-final-results',
    method: 'POST',
    data
  })
}
