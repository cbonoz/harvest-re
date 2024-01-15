import axios from 'axios'
import { formatMoney } from '.'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

export const searchProperties = async (body) => {
  const { data } = await api.post(`/predict`, body)
  return data.map((property) => ({
    'Readable Address': property.readable_address,
    'List Price ($)': formatMoney(property.list_price),
    'Predicted Price ($)': formatMoney(property.predicted),
    '% Difference': `${property.diff_percent.toFixed(2)}%`,
    Photo: property.primary_photo,
    latitude: property.latitude,
    longitude: property.longitude,
    Style: property.style,
    Bedrooms: property.beds,
    'Full Bathrooms': property.full_baths,
    Url: property.property_url,
  }))
}
