'use client'

import Head from 'next/head'
import { useState } from 'react'
import Image from 'next/image'

import Layout from '@components/Layout'
import Section from '@components/Section'
import Container from '@components/Container'
import Map from '@components/Map'
import Button from '@components/Button'

import styles from '@styles/Home.module.scss'
import { searchProperties } from 'src/util/api'
import PropertyTable from '@components/PropertyTable'
import { EXAMPLE_QUERIES } from 'src/util/constants'
import { gradientColor } from 'src/util'

const DEFAULT_CENTER = [38.907132, -77.036546]
const ZOOM = 12

export default function Home() {
  const [map, setMap] = useState(null)

  const [properties, setProperties] = useState([])
  const [accessCode, setAccessCode] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const getIconUrl = (position, num_markers) => {
    // Get a color based on the position index relative to the number of markers between green -> orange -> red for last in RGB format
    const color = gradientColor(position, num_markers)
    const leaf = window?.L || L
    const LeafIcon = leaf.Icon.extend({
      options: {},
    })
    return new LeafIcon({
      iconUrl: `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color}&chf=a,s,eee`,
    })
  }

  const setMapRef = (map) => {
    // log
    console.log('map', map)
    setMap(map.target)
  }

  const updateMarkersAndCenterMap = (ps) => {
    if (!ps || !ps.length) {
      return
    }

    const latLngs = ps.slice(1).map((p) => [p.latitude, p.longitude])
    map.flyTo(latLngs[0], ZOOM)
  }

  const goToProperty = (property) => {
    const latLng = [property.latitude, property.longitude]
    map.flyTo(latLng, ZOOM + 5)
  }

  async function search() {
    if (!query || !accessCode) {
      alert('Query and access code are required')
      return
    }

    setLoading(true)

    try {
      const result = await searchProperties({ query, access_code: accessCode })
      setProperties(result)
      updateMarkersAndCenterMap(result)
    } catch (error) {
      console.error(error)
      if (error.response) {
        alert(error.response.data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Harvest Real Estate</title>
        <meta
          name="description"
          content="Create mapping apps with Harvest Real Estate"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container>
          {/* Tailwind grid with sidebar */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3">
              {/* Sidebar */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Search anywhere</h2>
                <p className="text-gray-600">
                  We'll predict property values for active properties in your
                  desired area
                </p>

                {/* Input query */}
                <div className="flex-wrap -mx-2 overflow-hidden my-4">
                  <h3>Search:</h3>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  {/* passcode */}
                  <h3 className="mt-2">Access Code:</h3>
                  <input
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />

                  <Button
                    className="mt-2"
                    onClick={search}
                    loading={loading}
                    disabled={loading}
                  >
                    Search
                  </Button>
                  <br />
                  {loading && (
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span class="sr-only">Loading...</span>
                    </div>
                  )}
                </div>

                <hr />
                <div className="flex-wrap -mx-2 overflow-hidden my-4">
                  <h3>Examples:</h3>
                  {EXAMPLE_QUERIES.map((example) => (
                    <Button
                      type="link"
                      key={example}
                      className="mt-2 mr-2"
                      onClick={() => setQuery(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-9">
              <Map
                className={styles.homeMap}
                width="800"
                height="400"
                center={DEFAULT_CENTER}
                zoom={ZOOM}
                // ref={setMapRef}
                // whenCreated={setMapRef}
                whenReady={setMapRef}
              >
                {({ TileLayer, Marker, Popup }) => (
                  <>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {properties.map((property, i) => {
                      if (!property.latitude || !property.longitude) {
                        return null
                      }
                      return (
                        <Marker
                          key={i}
                          position={[property.latitude, property.longitude]}
                          icon={getIconUrl(i, properties.length)}
                          width={200}
                        >
                          <Popup>
                            <a
                              href={property.Url}
                              target="_blank"
                              className="cursor-pointer"
                            >
                              <Image
                                src={property.Photo}
                                width={200}
                                height={64}
                              />
                            </a>
                            <br />
                            <b>{property['Readable Address']}</b>
                            <br />
                            <b>
                              List Price: {property['List Price ($)']}
                              <br />
                              <hr />
                              <br />
                              Predicted: {property['Predicted Price ($)']} (
                              {property['% Difference']})
                            </b>
                          </Popup>
                        </Marker>
                      )
                    })}

                    {/* <Marker position={DEFAULT_CENTER}>
                      <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                      </Popup>
                    </Marker> */}
                  </>
                )}
              </Map>
              <hr />

              <PropertyTable onClick={goToProperty} properties={properties} />
            </div>
          </div>
          {/* Tailwind grid with sidebar */}
        </Container>
      </Section>
    </Layout>
  )
}
