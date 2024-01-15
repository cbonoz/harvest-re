import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export const searchProperties = async (body: any) => {
  const { data } = await api.post(`/predict`, body)
  return data
}
