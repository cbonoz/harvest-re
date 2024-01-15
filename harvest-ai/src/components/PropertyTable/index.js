'use client'

import { useMemo } from 'react'

// {
//   "readable_address": "186  Robin Hill Rd, Chelmsford, MA",
//   "style": "SINGLE_FAMILY",
//   "beds": 5,
//   "full_baths": 5,
//   "list_price": 949900,
//   "predicted": 1814783.7644187468,
//   "diff": 864883.7644187468,
//   "diff_percent": 91.0499804631,
//   "latitude": 42.573538,
//   "longitude": -71.376305,
//   "primary_photo": "http://ap.rdcpix.com/bb4c1f74aff1327b636069b6706c095cl-b919942028od-w480_h360_x2.webp?w=1080&q=75",
//   "property_url": "https://www.realtor.com/realestateandhomes-detail/3091561631"

const HIDDEN_PROPERTIES = new Set(['Url', 'Photo', 'latitude', 'longitude'])
// }
const PropertyTable = ({ properties, onClick }) => {
  if (!properties || properties.length === 0) {
    return <h3>No active properties selected</h3>
  }

  console.log('props', properties)

  const matches = properties
  const targetKeys = Object.keys(matches[0] || {}).filter(
    (key) => !HIDDEN_PROPERTIES.has(key)
  )

  return (
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            {targetKeys.map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matches.map((property) => (
            <tr
              className="hover pointer cursor-pointer"
              key={property.id}
              onClick={() => {
                const url = property.Url
                console.log('property', url)
                onClick(property)
              }}
            >
              {targetKeys.map((key) => (
                <td key={key}>{property[key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PropertyTable
