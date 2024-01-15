"use client"

import { useEffect } from "react"
import { Property } from "@/types"
import Leaflet from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import * as ReactLeaflet from "react-leaflet"

// leaflet style import
import "leaflet/dist/leaflet.css"

// https://github.com/colbyfayock/next-leaflet-starter/blob/main/src/components/Map/DynamicMap.js
const PropertyMap = ({ properties }: { properties: Property[] }) => {
  useEffect(() => {
    async function init() {
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "leaflet/images/marker-icon-2x.png",
        iconUrl: "leaflet/images/marker-icon.png",
        shadowUrl: "leaflet/images/marker-shadow.png",
      })
    }
    init()
  }, [])

  return (
    <div>
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default PropertyMap
