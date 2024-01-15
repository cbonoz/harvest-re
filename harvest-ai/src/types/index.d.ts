export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}
// {
//   "readable_address": "54  Stedman St, Chelmsford, MA",
//   "style": "SINGLE_FAMILY",
//   "beds": 3,
//   "full_baths": 2,
//   "list_price": 589900,
//   "predicted": 598303.3987998824,
//   "diff": 8403.3987998824,
//   "diff_percent": 1.4245463299,
//   "latitude": 42.612654,
//   "longitude": -71.344385,
//   "primary_photo": "http://ap.rdcpix.com/ddb300b96b95653f6997df8bb603572dl-m2356149508od-w480_h360_x2.webp?w=1080&q=75",
//   "property_url": "https://www.realtor.com/realestateandhomes-detail/4054194640"
// },
export type Property = {
  readable_address: string
  style: string
  beds: number
  full_baths: number
  list_price: number
  predicted: number
  diff: number
  diff_percent: number
  latitude: number
  longitude: number
  primary_photo: string
  property_url: string
}
