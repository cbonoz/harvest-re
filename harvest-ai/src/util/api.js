import axios from 'axios'
import { convertSnakeToCamelInObject } from '.'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export const searchProperties = async (body) => {
  const { data } = await api.post(`/predict`, body)
  return data.map(convertSnakeToCamelInObject)
}
